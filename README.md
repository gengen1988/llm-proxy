# Welcome to llm-proxy

This project serves as a reverse proxy, unifying access to various leading AI service providers like OpenAI, Vertex AI, and Perplexity through a single interface that adheres to the OpenAI API specifications. It streamlines the integration of diverse AI functionalities such as chat completions and embeddings generation, eliminating the complexity of direct API management and enabling seamless AI integration.

## Key Features

- **Unified API Access** Streamline your AI integrations with a single, unified API that connects you to multiple AI service providers.
- **Simplicity and Efficiency** Our project is designed for efficiency, removing unnecessary complexity and bloat to ensure faster integration times and more reliable performance for your applications.
- **Customizability** Adapt the proxy to your specific requirements for a seamless fit with your application's architecture.
- **Developer-Friendly** Our project prioritizes developer experience by providing detailed logs and error messages, making it easier to identify and resolve issues during the integration process.

## Supported Backends

| Provider               | Chat Completions     | Embeddings Generation |
|------------------------|----------------------|-----------------------|
| OpenAI                 | Yes                  | Yes                   |
| OpenAI Compatibles     | Yes (config baseURL) | Yes                   |
| Perplexity AI          | Yes                  | No                    |
| Vertex AI (Gemini Pro) | Yes                  | No (work in progress) |

## Getting Started

Start by setting up your environment as described in the `config.yaml.example` file. This initial configuration ensures a smooth integration process, with all necessary API keys from your selected AI service providers ready to go.

1. `npm install`
2. change the config.yaml.example to config.yaml
3. config your api keys
4. `npm start`

## How to Contribute

We welcome your contributions to enhance this reverse proxy project. If you have ideas for new features or improvements, please fork our repository and submit a pull request. By collaborating, we can make AI integration more accessible and efficient for the community.

Thank you for considering our open-source reverse proxy project. We are excited to see the innovative projects you will power with it and the advancements you will bring to AI integration!
