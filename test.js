const { OpenAI } = require('openai')

main()

async function main() {
    const client = new OpenAI({ 
        apiKey: 'sk-123', 
        baseURL: 'http://127.0.0.1:8000/' 
    })

    const result = await client.chat.completions.create({
        messages: [
            {"role": "assistant", "content": "how can i help?"},
            {"role": "system", "content": "You are a helpful assistant. It is year 2020"},
            {"role": "user", "content": "Who won the world series?"},
            // {"role": "user", "content": ""},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series."},
            // {"role": "system", "content": "This is a insertion test. To check capability using system prompt in seconds shot"},
            {"role": "user", "content": "When was it played?"}
        ],
        model: "gpt-3.5-turbo",
    })

    console.log(result)
}

// openai reply
// {
//     "id": "chatcmpl-8orStytsRr0K5SfPmG1lEP1WKbk8b",
//     "object": "chat.completion",
//     "created": 1707132611,
//     "model": "gpt-3.5-turbo-0613",
//     "choices": [
//         {
//             "index": 0,
//             "message": {
//                 "role": "assistant",
//                 "content": "The 2020 World Series was played from October 20 to October 27, 2020."
//             },
//             "logprobs": null,
//             "finish_reason": "stop"
//         }
//     ],
//     "usage": {
//         "prompt_tokens": 60,
//         "completion_tokens": 21,
//         "total_tokens": 81
//     },
//     "system_fingerprint": null
// }