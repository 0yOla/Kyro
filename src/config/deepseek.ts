import OpenAI from 'openai'
import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

/**
 * DeepSeek exposes an OpenAI-compatible API, so we use the official OpenAI SDK
 * with the DeepSeek base URL. See https://api-docs.deepseek.com
 */
const apiKey = process.env.DEEPSEEK_API_KEY

if (!apiKey) {
	logger.warn('DEEPSEEK_API_KEY is not set. DeepSeek requests will fail until it is configured in .env')
}

export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

/** `deepseek-chat` (V3) is the general model, `deepseek-reasoner` (R1) is the reasoning model. */
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

export const deepseek = new OpenAI({
	apiKey: apiKey || 'DEEPSEEK_API_KEY_MISSING',
	baseURL: DEEPSEEK_BASE_URL,
})

export interface GenerateJsonOptions {
	prompt: string
	/** JSON-schema-like description of the expected shape, embedded in the system prompt. */
	schema: object
	/** Name used when describing the schema to the model. */
	schemaName?: string
	model?: string
	/** Number of attempts for transient failures (429 / 5xx). */
	maxAttempts?: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryable = (error: any): boolean => {
	const status = error?.status ?? error?.response?.status
	if (status === 429 || (status >= 500 && status < 600)) return true
	const message = error instanceof Error ? error.message : String(error)
	return /429|too many requests|503|service unavailable|rate limit/i.test(message)
}

/**
 * DeepSeek only supports `response_format: { type: 'json_object' }` — it does not
 * enforce a JSON schema like Gemini's `responseSchema`, so the schema is embedded
 * in the system prompt instead and the result is parsed/validated locally.
 */
export async function generateJson<T = any>(options: GenerateJsonOptions): Promise<T> {
	const { prompt, schema, schemaName = 'response', model = DEEPSEEK_MODEL, maxAttempts = 3 } = options

	const systemPrompt = [
		`You must respond with a single valid JSON object and nothing else.`,
		`No markdown, no code fences, no explanations — only raw JSON.`,
		`The JSON must conform to the "${schemaName}" schema below. Respect every "required" field.`,
		`\nSchema:\n${JSON.stringify(schema, null, 2)}`,
	].join('\n')

	let lastError: unknown

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const completion = await deepseek.chat.completions.create({
				model,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt },
				],
			})

			const content = completion.choices[0]?.message?.content

			if (!content) {
				logger.info('No response received from the AI model. || Service Unavailable')
				throw new Error('Service unavailable!')
			}

			return JSON.parse(content) as T
		} catch (error) {
			lastError = error

			if (!isRetryable(error) || attempt === maxAttempts) break

			const waitMs = 5000 * attempt
			logger.error(`DeepSeek request failed (attempt ${attempt}/${maxAttempts}), retrying in ${waitMs}ms...`)
			await sleep(waitMs)
		}
	}

	if (lastError instanceof Error) {
		logger.error(`Error generating content from DeepSeek: ${lastError.message}`)
		throw lastError
	}

	const message = 'An unknown error occurred.'
	logger.error(message)
	throw new Error(message)
}

/**
 * The model is asked to reply with an object because DeepSeek's JSON mode cannot
 * return a bare array. Schemas describing a list wrap it in `{ "items": [...] }`;
 * this unwraps the list so callers keep the previous array behaviour.
 */
export function asArray<T = any>(payload: any): T[] {
	if (Array.isArray(payload)) return payload as T[]
	if (payload && Array.isArray(payload.items)) return payload.items as T[]
	if (payload === undefined || payload === null) return []
	return [payload as T]
}

/**
 * Convenience wrapper for single-object responses that were previously modelled
 * as a one-element array by the Gemini schema.
 */
export function firstItem<T = any>(payload: any): T | undefined {
	return asArray<T>(payload)[0]
}
