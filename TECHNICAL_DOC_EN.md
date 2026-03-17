# Technical Documentation - TC_Gener

TC_Gener is a Context-Aware Test Case Generator that leverages RAG (Retrieval-Augmented Generation) technology to understand your source code and documentation.

## 1. Technology Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI UI**: [Vercel AI SDK (UI)](https://sdk.vercel.ai/docs/api-reference/use-chat) - Handles streaming and chat state management.

### Backend & AI
- **LLM**: [Google Gemini 2.5 Flash](https://aistudio.google.com/) - Primary model for language processing and test code generation.
- **Embeddings**: `gemini-embedding-001` - Converts text into vectors for context retrieval.
- **Vector Database**: [Qdrant](https://qdrant.tech/) - High-performance vector storage and retrieval.
- **Orchestration**: [LangChain](https://js.langchain.com/) - Manages the RAG flow, connects the Vector Store, and handles document processing.
- **PDF Parsing**: `pdfjs-dist` - Extracts text from PDF documentation.

---

## 2. System Workflow

The system operates through two primary phases: **Ingestion** and **Generation**.

### A. Ingestion Flow
1. **Upload**: Users upload source code (.ts, .js) or documentation (.pdf) through the UI.
2. **Processing**: The `/api/ingest` endpoint receives the files.
   - For PDFs, `pdfjs-dist` is used to extract raw text.
   - Text is split into chunks to optimize retrieval relevance.
3. **Embedding**: Each chunk is sent to the Google Gemini API (`gemini-embedding-001`) to generate a 3072-dimensional vector.
4. **Storage**: These vectors, along with the original content, are stored in the `code_context` collection in Qdrant.

### B. Generation Flow (RAG)
1. **Request**: The user enters a request (e.g., "Write a unit test for the login function").
2. **Retrieval**: The `/api/generate` endpoint:
   - Converts the user's prompt into a vector (embedding).
   - Performs a **Similarity Search** in Qdrant to find the top 3 most relevant context chunks.
3. **Augmentation**: Combines the user's request with the retrieved context into a specialized QA Architect **System Prompt**.
4. **Generation**: Sends the augmented prompt to Gemini 2.5 Flash.
5. **Streaming**: The response is streamed back to the UI in real-time using Server-Sent Events via the Vercel AI SDK.

---

## 3. Key Directory Structure
- `/src/app/api/ingest`: Logic for data ingestion and vectorization.
- `/src/app/api/generate`: Logic for RAG and LLM interaction.
- `/src/components`: UI components (Chat, File Upload).
- `/public/workers`: PDF worker processing to keep the main thread responsive.

---

## 4. Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY`: API Key from Google AI Studio.
- `QDRANT_URL`: Qdrant server URL (defaults to localhost:6333).
