import { afterEach, describe, expect, it, vi } from 'vitest'

// The OpenAI SDK is replaced with a stub so tests never touch the network.
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))

vi.mock('openai', () => ({
	default: class MockOpenAI {
		chat = { completions: { create: createMock } }
	},
}))

// Mock the logger so importing the client doesn't create a real logs/ directory.
vi.mock('../src/config/logger', () => ({
	default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

import { DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, asArray, firstItem, generateJson } from '../src/config/deepseek'

const completion = (content: string) => ({ choices: [{ message: { content } }] })

const httpError = (status: number, message: string) => {
	const error = new Error(message) as Error & { status: number }
	error.status = status
	return error
}

/**
 * generateJson backs off with real setTimeout calls, so tests run on fake timers
 * and advance virtual time in chunks until the promise settles.
 */
const settleWithFakeTimers = async <T>(promise: Promise<T>): Promise<{ result?: T; error?: unknown }> => {
	const outcome: { result?: T; error?: unknown } = {}
	let done = false

	promise.then(
		(value) => {
			outcome.result = value
			done = true
		},
		(error) => {
			outcome.error = error
			done = true
		}
	)

	for (let elapsed = 0; elapsed < 120_000 && !done; elapsed += 5_000) {
		await vi.advanceTimersByTimeAsync(5_000)
	}
	await Promise.resolve()

	return outcome
}

afterEach(() => {
	vi.useRealTimers()
})

describe('DeepSeek client configuration', () => {
	it('targets an OpenAI-compatible DeepSeek endpoint', () => {
		expect(DEEPSEEK_BASE_URL).toMatch(/^https:\/\//)
		expect(DEEPSEEK_BASE_URL).toContain('deepseek')
	})

	it('defaults to a DeepSeek model', () => {
		expect(DEEPSEEK_MODEL).toMatch(/^deepseek-(chat|reasoner)/)
	})
})

describe('asArray', () => {
	it('passes an array through unchanged', () => {
		expect(asArray([{ a: 1 }, { b: 2 }])).toEqual([{ a: 1 }, { b: 2 }])
	})

	it('unwraps the { items: [...] } wrapper used for list schemas', () => {
		expect(asArray({ items: [{ a: 1 }] })).toEqual([{ a: 1 }])
	})

	it('wraps a bare object into a single-element array', () => {
		expect(asArray({ a: 1 })).toEqual([{ a: 1 }])
	})

	it('returns an empty array for nullish payloads', () => {
		expect(asArray(null)).toEqual([])
		expect(asArray(undefined)).toEqual([])
	})

	it('wraps the payload when items is present but not an array', () => {
		expect(asArray({ items: 'oops' })).toEqual([{ items: 'oops' }])
	})
})

describe('firstItem', () => {
	it('returns the first element of an unwrapped list', () => {
		expect(firstItem({ items: [{ a: 1 }, { b: 2 }] })).toEqual({ a: 1 })
	})

	it('returns undefined when the list is empty', () => {
		expect(firstItem({ items: [] })).toBeUndefined()
		expect(firstItem([])).toBeUndefined()
	})

	it('returns a bare object as-is', () => {
		expect(firstItem({ a: 1 })).toEqual({ a: 1 })
	})
})

describe('generateJson request wiring', () => {
	it('uses JSON mode, embeds the schema, and sends the prompt as the user message', async () => {
		createMock.mockResolvedValue(completion('{"ok":true}'))

		const schema = { type: 'object', required: ['ok'] }
		await generateJson({ prompt: 'the prompt', schema, schemaName: 'mySchema', maxAttempts: 1 })

		const args = createMock.mock.calls[0][0]
		expect(args.model).toBe(DEEPSEEK_MODEL)
		expect(args.response_format).toEqual({ type: 'json_object' })
		expect(args.messages[0].role).toBe('system')
		expect(args.messages[0].content).toContain('mySchema')
		expect(args.messages[0].content).toContain('"required"')
		expect(args.messages[1]).toEqual({ role: 'user', content: 'the prompt' })
	})

	it('parses and returns the JSON response payload', async () => {
		createMock.mockResolvedValue(completion('{"items":[{"ok":true}]}'))

		await expect(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 1 })).resolves.toEqual({ items: [{ ok: true }] })
		expect(createMock).toHaveBeenCalledTimes(1)
	})
})

describe('generateJson retry behaviour', () => {
	it('retries on 429 and returns the eventual success', async () => {
		vi.useFakeTimers()
		createMock.mockRejectedValueOnce(httpError(429, '429 Too Many Requests')).mockResolvedValueOnce(completion('{"ok":true}'))

		const { result } = await settleWithFakeTimers(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 3 }))

		expect(result).toEqual({ ok: true })
		expect(createMock).toHaveBeenCalledTimes(2)
	})

	it('retries on 5xx status codes', async () => {
		vi.useFakeTimers()
		createMock.mockRejectedValueOnce(httpError(503, 'Service Unavailable')).mockResolvedValueOnce(completion('{"ok":true}'))

		const { result } = await settleWithFakeTimers(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 3 }))

		expect(result).toEqual({ ok: true })
		expect(createMock).toHaveBeenCalledTimes(2)
	})

	it('does not retry a non-retryable error such as an invalid API key', async () => {
		createMock.mockRejectedValue(httpError(401, '401 Authentication Fails, Your api key: ****xxxx is invalid'))

		await expect(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 3 })).rejects.toThrow('Authentication Fails')
		expect(createMock).toHaveBeenCalledTimes(1)
	})

	it('gives up after maxAttempts and rethrows the last error', async () => {
		vi.useFakeTimers()
		const rateLimited = httpError(429, '429 Too Many Requests')
		createMock.mockRejectedValue(rateLimited)

		const { error } = await settleWithFakeTimers(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 3 }))

		expect(createMock).toHaveBeenCalledTimes(3)
		expect(error).toBe(rateLimited)
	})

	it('retries an empty completion and surfaces "Service unavailable!" once exhausted', async () => {
		vi.useFakeTimers()
		createMock.mockResolvedValue(completion(''))

		const { error } = await settleWithFakeTimers(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 2 }))

		expect(createMock).toHaveBeenCalledTimes(2)
		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toBe('Service unavailable!')
	})

	it('does not retry malformed JSON', async () => {
		createMock.mockResolvedValue(completion('this is not json'))

		await expect(generateJson({ prompt: 'hi', schema: {}, maxAttempts: 3 })).rejects.toThrow()
		expect(createMock).toHaveBeenCalledTimes(1)
	})
})
