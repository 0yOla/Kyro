/** JSON Schema type names accepted by the DeepSeek (OpenAI-compatible) API. */
export type SchemaType = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null'

export interface PostDataSchema {
	description: string
	type: SchemaType
	properties: {
		items: {
			type: SchemaType
			items: {
				type: SchemaType
				properties: {
					postContent: {
						type: SchemaType
						description: string
						nullable: boolean
					}
					viraRate: {
						type: SchemaType
						description: string
						nullable: boolean
					}
					postImageQuery: {
						type: SchemaType
						description: string
						nullable: boolean
					}
				}
				required: string[]
			}
		}
	}
	required: string[]
}

export const getPostDataSchema = (): PostDataSchema => {
	return {
		description: `Schema for posting after viewing the JSON DATA for a user persona`,
		type: 'object',
		properties: {
			items: {
				// DeepSeek's JSON mode can only return a JSON object, so the list is wrapped.
				type: 'array',
				items: {
					type: 'object',
					properties: {
						postContent: {
							type: 'string',
							description: 'A post between 100 and 250 characters long. do not add hashtags',
							nullable: false,
						},
						viraRate: {
							type: 'number',
							description:
								'The viral rate, meaning the rate of the content to go viral when posted, measured on a scale of 0 to 100.',
							nullable: false,
						},
						postImageQuery: {
							type: 'string',
							description:
								'A precise image search query to fetch a exact image that matches the post via the Google Custom Search API',
							nullable: true,
						},
					},
					required: ['postContent', 'viraRate', 'postImageQuery'],
				},
			},
		},
		required: ['items'],
	}
}

export interface CharacterSchema {
	description: string
	type: SchemaType
	properties: {
		fileName: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		name: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		password: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		email: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		profileVerification: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		profileImageQuery: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		age: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		gender: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		location: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		occupation: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		agentId: {
			type: SchemaType
			description: string
			nullable: boolean
		}
		settings: {
			type: SchemaType
			description: string
			properties: {
				voice: {
					type: SchemaType
					properties: {
						model: {
							type: SchemaType
							description: string
							nullable: boolean
						}
					}
					required: string[]
				}
			}
			required: string[]
		}
		bio: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
			}
			nullable: boolean
		}
		lore: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
			}
			nullable: boolean
		}
		knowledge: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
			}
			nullable: boolean
		}
		messageExamples: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
				properties: {
					userMessage: {
						type: SchemaType
						description: string
						nullable: boolean
					}
					agentRelytoMessage: {
						type: SchemaType
						description: string
						nullable: boolean
					}
				}
				required: string[]
			}
			nullable: boolean
		}
		postExamples: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
				properties: {
					user: {
						type: SchemaType
						description: string
						nullable: boolean
					}
					content: {
						type: SchemaType
						description: string
						nullable: boolean
					}
				}
				required: string[]
			}
			nullable: boolean
		}
		topics: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
			}
			nullable: boolean
		}
		style: {
			type: SchemaType
			description: string
			properties: {
				all: {
					type: SchemaType
					description: string
					items: {
						type: SchemaType
					}
					nullable: boolean
				}
				chat: {
					type: SchemaType
					description: string
					items: {
						type: SchemaType
					}
					nullable: boolean
				}
				post: {
					type: SchemaType
					description: string
					items: {
						type: SchemaType
					}
					nullable: boolean
				}
			}
			required: string[]
		}
		adjectives: {
			type: SchemaType
			description: string
			items: {
				type: SchemaType
			}
			nullable: boolean
		}
	}
	required: string[]
}
export const getCharacterSchema = (): CharacterSchema => {
	return {
		description: `Schema for configuring an AI agent with settings, bio, lore, knowledge, message examples, topics, style preferences, and adjectives.`,
		type: 'object',
		properties: {
			fileName: {
				type: 'string',
				description:
					'The file name of agent persona i.e (agentname.character.json as example elonMusk.character.json) note:: camelCase for ai agent name .',
				nullable: false,
			},
			name: {
				type: 'string',
				description: 'The name of the agent.',
				nullable: false,
			},
			profileImageQuery: {
				type: 'string',
				description: ' A precise image search query to fetch a exact profile image via the Google Custom Search API',
				nullable: false,
			},
			profileVerification: {
				type: 'boolean',
				description: 'The profileVerification blue tick of the agent.',
				nullable: false,
			},
			gender: {
				type: 'string',
				description: 'The gender of the agent.',
				nullable: false,
			},
			password: {
				type: 'string',
				description:
					'A 8 hard unique and strong random password for the agent account. randomize from here to create one :: "#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%$@!*?"',
				nullable: false,
			},
			email: {
				type: 'string',
				description: 'A unique and strong gmail email address with for the agent account.',
				nullable: false,
			},
			age: {
				type: 'string',
				description: 'The age of the agent.',
				nullable: false,
			},
			location: {
				type: 'string',
				description: 'The location of the agent.',
				nullable: false,
			},
			occupation: {
				type: 'string',
				description: 'The occupation of the agent.',
				nullable: false,
			},
			agentId: {
				type: 'string',
				description:
					"A unique identifier for the agent, formatted as 'aiAGENT_name_+ 6 randomn charaters supflix' i.e aiAGENT_name_589062",
				nullable: false,
			},
			settings: {
				type: 'object',
				description: 'Settings for the agent, including voice configuration.',
				properties: {
					voice: {
						type: 'object',
						properties: {
							model: {
								type: 'string',
								description: "The voice model for the agent (e.g., 'en_US-male-medium').",
								nullable: false,
							},
						},
						required: ['model'],
					},
				},
				required: ['voice'],
			},
			bio: {
				type: 'array',
				description:
					"An array of strings describing the agent's biography, note: must be minimum length of 160 char count",
				items: { type: 'string' },
				nullable: false,
			},
			lore: {
				type: 'array',
				description: "An array of strings defining the agent's lore or backstory.",
				items: { type: 'string' },
				nullable: false,
			},
			knowledge: {
				type: 'array',
				description: "An array of strings containing the agent's knowledge base.",
				items: { type: 'string' },
				nullable: false,
			},
			messageExamples: {
				type: 'array',
				description: "Example QA message interactions for  (btw 'Friend' and 'Agent Name')",
				items: {
					type: 'object',
					properties: {
						userMessage: {
							type: 'string',
							description: 'The message content sent to the agent.',
							nullable: false,
						},
						agentRelytoMessage: {
							type: 'string',
							description: 'The agent reply to the user messsage content.',
							nullable: false,
						},
					},
					required: ['userMessage', 'agentRelytoMessage'],
				},
				nullable: false,
			},
			postExamples: {
				type: 'array',
				description: 'Examples of social media posts by the agent.',
				items: {
					type: 'object',
					properties: {
						user: {
							type: 'string',
							description: 'The user posting the example.',
							nullable: false,
						},
						content: {
							type: 'string',
							description: 'The post content.',
							nullable: false,
						},
					},
					required: ['user', 'content'],
				},
				nullable: false,
			},
			topics: {
				type: 'array',
				description: 'An array of topics the agent is proficient in.',
				items: { type: 'string' },
				nullable: false,
			},
			style: {
				type: 'object',
				description: "The agent's style preferences for communication.",
				properties: {
					all: {
						type: 'array',
						description: 'General style adjectives.',
						items: { type: 'string' },
						nullable: false,
					},
					chat: {
						type: 'array',
						description: 'Style preferences specific to chat interactions.',
						items: { type: 'string' },
						nullable: false,
					},
					post: {
						type: 'array',
						description: 'Style preferences specific to posts.',
						items: { type: 'string' },
						nullable: false,
					},
				},
				required: ['all', 'chat', 'post'],
			},
			adjectives: {
				type: 'array',
				description: 'A list of adjectives describing the agent.',
				items: { type: 'string' },
				nullable: false,
			},
		},
		required: [
			'fileName',
			'name',
			'agentId',
			'settings',
			'bio',
			'lore',
			'knowledge',
			'messageExamples',
			'postExamples',
			'topics',
			'style',
			'adjectives',
			'profileImageQuery',
			'profileVerification',
			'gender',
			'password',
			'email',
		],
	}
}
