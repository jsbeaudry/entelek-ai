# Entèlèk AI

## Overview

This project is a locally hosted AI system leveraging Large Language Models (LLMs) and vision models to perform various AI-driven tasks. It is designed to run efficiently on local hardware, making use of Ollama for model execution and a tech stack including Node.js, JavaScript/TypeScript, and Next.js for frontend interactions.

## 🚀 Features

- **Run LLMs Locally** – No need for external APIs; execute models on your own machine.
- **Vision Model Support** – Extract insights from images and documents.
- **Multi-Language** – Interact in different languages.
- **Project History** – Keep track of past interactions.
- **Supports multiple LLM models**: Llama, DeepSeek, Mistral, etc.
- **Modular API**: Built with Node.js for easy integration.
- **Frontend Interface**: Developed with Next.js for user interaction.

## 🎨 User Experience

Entèlèk AI is designed with simplicity and efficiency in mind:

- **Minimalist UI** – A dark-themed, distraction-free interface.
- **Chat-Based Interaction** – Users can chat with AI in a natural way.
- **Quick Model Switching** – Select different LLMs and vision models seamlessly.
- **History & Persistence** – Keep track of your conversations and tasks.

## Features

## Tech Stack

- **Backend**: Next.js server (JavaScript/TypeScript)
- **LLMs**: Llama, DeepSeek, Mistral
- **Vision Models**: Moondream
- **Model Runtime**: Ollama
- **Frontend**: Next.js

## Requirements

- **Ollama** installed
- **Node.js** (v18+ recommended)

## Installation

### 1. Install Ollama and Nodejs

- Download and install Ollama from [here](https://ollama.ai).
- Download and install Nodejs from [here](https://nodejs.org/en/download).

### 2. Once install open your teminal, copy and paste the model name you want to use

```bash
ollama run deepseek-r1:7b
ollama run moondream
```

### 3. Clone the Repository

```bash
git clone https://github.com/your-repo/local-ai-system.git
cd local-ai-system
```

### 4. Install Dependencies

```bash
yarn install
```

### 4. Run application

```bash
yarn dev
```

## Roadmap

### Phase 1: Local Integration - (DONE)

- Set up a local environment to run LLMs and vision models.
- Optimize Ollama execution.
- Develop a Node.js API for model interaction.

### Phase 2: Image and Document Data Extraction - (DONE)

- Implement document parsing for PDFs and images.
- Leverage vision models to extract structured data.

### Phase 3: Retrieval-Augmented Generation (RAG) - (PENDING)

- Build a vector database for efficient context retrieval.
- Implement search and indexing of documents.

### Phase 4: Context-Augmented Generation (CAG) - (PENDING)

- Enhance LLM responses by adding structured context.
- Improve prompt engineering for better results.

### Phase 5: Create datasets - (PENDING)

- Create custom datasets for improved accuracy.
- Experiment with multiple techniques to enhance performance.

### Phase 6: Full Model Training - (PENDING)

- Train models on custom datasets for improved accuracy.
- Explore local training of custom models.
- Implement distributed training strategies.

## Contribution

We welcome contributions! Feel free to submit pull requests or open issues.

## License

[MIT License](LICENSE)
