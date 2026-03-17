import { NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Handle different payload formats from various AI SDK versions
    let prompt = "";
    if (body.prompt) {
      prompt = body.prompt;
    } else if (body.text) {
      prompt = body.text;
    } else if (Array.isArray(body.messages)) {
      const lastMessage = body.messages.filter((m: any) => m.role === "user").pop();
      if (lastMessage) {
        if (typeof lastMessage.content === "string") {
          prompt = lastMessage.content;
        } else if (lastMessage.text) {
          prompt = lastMessage.text;
        } else if (Array.isArray(lastMessage.parts)) {
          prompt = lastMessage.parts
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("");
        }
      }
    }

    if (!prompt) {
      return NextResponse.json({
        error: "No prompt or text provided"
      }, { status: 400 });
    }
    let contextText = "";

    // 1. Retrieve Context from Vector DB (RAG)
    try {
      const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-001", // Supported Google embedding model for v1beta
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });

      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: "code_context",
      });

      // Retrieve top 3 most relevant chunks
      const results = await vectorStore.similaritySearch(prompt, 3);
      contextText = results.map(r => r.pageContent).join("\n\n---\n\n");
    } catch (e) {
      console.warn("Could not retrieve context from Qdrant, proceeding without it.", e);
      contextText = "No relevant context found or DB is unreachable.";
    }

    // 2. Construct System Prompt with Context
    const systemPrompt = `You are an expert Principal QA AI Architect. 
Your primary task is to write 100% syntactically correct, modern Unit Tests for the user's specific request.

Here are your strict rules:
1. Ensure all external databases, APIs, and side effects are PERFECTLY mocked. NO hallucinated network calls are allowed.
2. Only output code. Provide a minimal markdown explanation if absolutely necessary, but prioritize the test code.
3. Use the exact context provided below to understand the business logic and structure you are testing.
4. If testing a React component, use React Testing Library & Vitest/Jest. If testing a backend API, use Supertest & Vitest/Jest.

--- RETRIEVED CONTEXT ---
${contextText}
-------------------------`;

    // 3. Stream Response using Vercel AI SDK
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
