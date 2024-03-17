const { Anthropic } = require('@anthropic-ai/sdk')
const winston = require('winston')

module.exports = function (config) {
  const apiKey = config['apiKey']
  const client = new Anthropic({ apiKey })

  return {
    '/chat/completions'(params, override) {
      params = extractSystemPrompt(params)
      const body = { ...params, ...override }
      return client.messages.create(body)
        .then(toOpenAIResponse)
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

function toOpenAIResponse(response) {
  winston.debug(`convert anthropic response: ${JSON.stringify(response, null, 2)}`)
  return {
    id: response.id,
    model: response.model,
    usage: response.usage,
    choices: [
      {
        message: {
          role: response.role,
          content: response.content[0].text
        },
        finish_reason: response.stop_reason
      }
    ],
  }
}