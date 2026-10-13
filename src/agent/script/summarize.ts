/* eslint-disable no-unused-vars */
import logger from '../../config/logger'
import { generateJson, asArray } from '../../config/deepseek'

import dotenv from 'dotenv'
dotenv.config()

function cleanTranscript(rawTranscript: string): string {
	// Remove music or any similar tags like [Music], [Applause], etc.
	const cleaned = rawTranscript.replace(/\[.*?\]/g, '')
	const decoded = cleaned.replace(/&amp;#39;/g, "'")
	return decoded
}

// comment
const MainPrompt =
	'You are tasked with transforming the YouTube video transcript into a training-ready system prompt. The goal is to format the transcript into structured data without reducing its content, and prepare it for use in training another AI model.'

export const getYouTubeTranscriptSchema = () => {
	return {
		description: `Transform the YouTube video transcript into a structured format, suitable for training another AI model. Ensure the content remains intact and is formatted correctly.`,
		type: 'object',
		properties: {
			items: {
				type: 'array',
				description: 'A single-element array holding the transformed transcript.',
				items: {
					type: 'object',
					properties: {
						transcriptTitle: {
							type: 'string',
							description: 'The title of the YouTube video transcript.',
						},
						fullTranscript: {
							type: 'string',
							description: 'The full, unaltered YouTube video transcript.',
						},
						contentTokenCount: {
							type: 'string',
							description: 'The total number of tokens in the full transcript.',
						},
					},
					required: ['transcriptTitle', 'fullTranscript', 'contentTokenCount'],
				},
			},
		},
		required: ['items'],
	}
}

export async function generateTrainingPrompt(transcript: string, prompt: string = MainPrompt): Promise<any> {
	const schema = getYouTubeTranscriptSchema()

	const cleanedTranscript = cleanTranscript(transcript)
	// Combine the prompt, title, and transcript for processing
	const combinedPrompt = `${prompt}\n\nVideo Transcript:\n${cleanedTranscript}`

	try {
		const response = await generateJson({
			prompt: combinedPrompt,
			schema,
			schemaName: 'youtubeTranscript',
		})

		return asArray(response)
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Error generating training prompt:', error.message)
			return `An error occurred: ${error.message}`
		} else {
			logger.error('An unknown error occurred:', error)
			return 'An unknown error occurred.'
		}
	}
}

// comment
const MainPrompt_2 =
	'You are tasked with transforming the webite scrapped data into a training-ready system prompt. The goal is to format the data into structured data without reducing its content, and prepare it for use in training another AI model.'

export const getWebsiteScrapeDatatSchema = () => {
	return {
		description: `Transform the website data into a structured format, suitable for training another AI model. Ensure the content remains intact and is formatted correctly.`,
		type: 'object',
		properties: {
			items: {
				type: 'array',
				description: 'A single-element array holding the transformed website data.',
				items: {
					type: 'object',
					properties: {
						content: {
							type: 'string',
							description: 'The full, unaltered website scraped data.',
						},
					},
					required: ['content'],
				},
			},
		},
		required: ['items'],
	}
}

export async function generateCleanWebsiteData(data: string, prompt: string = MainPrompt_2): Promise<any> {
	const schema = getWebsiteScrapeDatatSchema()

	const cleanedTranscript = cleanTranscript(data)
	// Combine the prompt, title, and transcript for processing
	const combinedPrompt = `${prompt}\n\nVideo Transcript:\n${cleanedTranscript}`

	try {
		const response = await generateJson({
			prompt: combinedPrompt,
			schema,
			schemaName: 'websiteScrapeData',
		})

		return asArray(response)
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Error generating training prompt:', error.message)
			return `An error occurred: ${error.message}`
		} else {
			logger.error('An unknown error occurred:', error)
			return 'An unknown error occurred.'
		}
	}
}
