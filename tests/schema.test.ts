import { describe, expect, it, vi } from 'vitest'

// summarize.ts pulls in the logger and the DeepSeek client; stub both so the
// schema builders can be imported without file or network side effects.
vi.mock('../src/config/logger', () => ({
	default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

vi.mock('openai', () => ({
	default: class MockOpenAI {
		chat = { completions: { create: vi.fn() } }
	},
}))

import { getCharacterSchema, getPostDataSchema } from '../src/agent/schema'
import { getWebsiteScrapeDatatSchema, getYouTubeTranscriptSchema } from '../src/agent/script/summarize'
import { asArray } from '../src/config/deepseek'

/** Valid JSON Schema primitives the OpenAI-compatible API understands. */
const VALID_TYPES = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']

const collectTypes = (node: unknown, acc: string[] = []): string[] => {
	if (!node || typeof node !== 'object') return acc

	const record = node as Record<string, unknown>
	if (typeof record.type === 'string') acc.push(record.type)

	for (const value of Object.values(record)) {
		if (value && typeof value === 'object') collectTypes(value, acc)
	}

	return acc
}

const allSchemas = () => ({
	postData: getPostDataSchema(),
	character: getCharacterSchema(),
	youtubeTranscript: getYouTubeTranscriptSchema(),
	websiteScrapeData: getWebsiteScrapeDatatSchema(),
})

describe('schema builders', () => {
	it('only ever emits lowercase JSON Schema types', () => {
		for (const [name, schema] of Object.entries(allSchemas())) {
			const types = collectTypes(schema)
			expect(types.length, `${name} should declare at least one type`).toBeGreaterThan(0)

			for (const type of types) {
				expect(VALID_TYPES, `${name} emitted an invalid type: "${type}"`).toContain(type)
				// Guards against a regression back to Gemini's SchemaType.STRING-style enums.
				expect(type, `${name} emitted a non-lowercase type: "${type}"`).not.toMatch(/^[A-Z_]+$/)
			}
		}
	})

	it('getPostDataSchema describes an object-wrapped array of posts', () => {
		const schema = getPostDataSchema()

		expect(schema.type).toBe('object')
		expect(schema.required).toContain('items')
		expect(schema.properties.items.type).toBe('array')
		expect(schema.properties.items.items.properties.viraRate.type).toBe('number')
		expect(schema.properties.items.items.required).toEqual(['postContent', 'viraRate', 'postImageQuery'])
	})

	it('getCharacterSchema keeps its previously required top-level fields', () => {
		const schema = getCharacterSchema()

		expect(schema.type).toBe('object')
		for (const field of ['fileName', 'name', 'agentId', 'settings', 'bio']) {
			expect(schema.required, `missing required field: ${field}`).toContain(field)
		}
		expect(schema.properties.bio.type).toBe('array')
		expect(schema.properties.style.properties.all.type).toBe('array')
		expect(schema.properties.style.required).toEqual(['all', 'chat', 'post'])
	})
})

describe('list-schema response contract', () => {
	it('summarize schemas request an object wrapper that asArray unwraps', () => {
		const schema = getYouTubeTranscriptSchema()

		expect(schema.type).toBe('object')
		expect(schema.required).toContain('items')
		expect(schema.properties.items.type).toBe('array')

		// DeepSeek's JSON mode cannot return a bare array, so the model replies with
		// an object and asArray restores the array shape callers expect.
		const payload = { items: [{ transcriptTitle: 'T', fullTranscript: 'F', contentTokenCount: '3' }] }
		expect(asArray(payload)).toEqual([{ transcriptTitle: 'T', fullTranscript: 'F', contentTokenCount: '3' }])
	})

	it('the website schema unwraps to a single content entry', () => {
		const schema = getWebsiteScrapeDatatSchema()

		expect(schema.required).toContain('items')
		expect(schema.properties.items.type).toBe('array')
		expect(schema.properties.items.items.required).toEqual(['content'])
		expect(asArray({ items: [{ content: 'scraped text' }] })).toEqual([{ content: 'scraped text' }])
	})
})
