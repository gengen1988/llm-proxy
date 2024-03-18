const { Anthropic } = require('@anthropic-ai/sdk')
const winston = require('winston')

module.exports = function (config) {
  const { apiKey } = config

  const client = new Anthropic({ apiKey })

  return {
    '/chat/completions'(params, override) {
      params = extractSystemPrompt(params)
      const body = { ...params, ...override }
      return client.messages.create(body)
        .then(toOpenAIChatResponse)
    }
  }
}

function extractSystemPrompt(params) {
  const systemPrompt = params.messages
    .filter(m => m.role == 'system')
    .reduce((m, acc) => `${acc}\n${m.content}`, '')
  const newMessages = params.messages.filter(m => m.role != 'system')
  params.system = systemPrompt
  params.messages = newMessages
  return params
}

function toOpenAIChatResponse(anthropicChatResponse) {
  winston.debug(`convert anthropic response: ${JSON.stringify(anthropicChatResponse, null, 2)}`)
  return {
    id: anthropicChatResponse.id,
    object: 'chat.completion',
    model: anthropicChatResponse.model,
    usage: anthropicChatResponse.usage,
    choices: [
      {
        index: 0,
        message: {
          role: anthropicChatResponse.role,
          content: anthropicChatResponse.content[0].text
        },
        finish_reason: anthropicChatResponse.stop_reason
      }
    ],
  }
}