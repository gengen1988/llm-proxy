const { Anthropic } = require('@anthropic-ai/sdk')
const winston = require('winston')

module.exports = function (config) {
  const { apiKey } = config

  const client = new Anthropic({ apiKey })

  return {
    async '/chat/completions'(params, override) {
      params = extractSystemPrompt(params)
      const body = { ...params, ...override }
      const response = await client.messages.create(body)
      return toOpenAIChatResponse(response)
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

function toOpenAIChatResponse(anthropicClientResponse) {
  winston.debug(`convert anthropic response: ${JSON.stringify(anthropicClientResponse, null, 2)}`)
  return {
    id: anthropicClientResponse.id,
    object: 'chat.completion',
    model: anthropicClientResponse.model,
    usage: anthropicClientResponse.usage,
    choices: [
      {
        index: 0,
        message: {
          role: anthropicClientResponse.role,
          content: anthropicClientResponse.content[0].text,
        },
        finish_reason: anthropicClientResponse.stop_reason,
      }
    ],
  }
}