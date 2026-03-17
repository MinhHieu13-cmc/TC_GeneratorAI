import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFParse } from "pdf-parse";
import path from "path";
import { pathToFileURL } from "url";

// In a real app we would chunk and index into Qdrant.
// For this PoC to be stateless until Qdrant is up and stable, we'll demonstrate the mechanics.
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let text = "";
    const fileName = file.name;

    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Fix for Next.js worker resolution issue on Windows (ESM requires file:// protocol)
      const workerPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
      PDFParse.setWorker(pathToFileURL(workerPath).href);
      
      const parser = new PDFParse({ 
        data: buffer,
        isEvalSupported: false 
      });
      
      const pdfData = await parser.getText();
      text = pdfData.text;
    } else {
      text = await file.text();
    }

    // 1. Text Chunking
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const docOutput = await splitter.createDocuments([text], [{ source: fileName }]);

    // 2. Embedding & Vector Indexing
    // Ensure you have GOOGLE_GENERATIVE_AI_API_KEY in .env.local
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Try to connect to Qdrant, if it fails gracefully let the user know.
    try {
      await QdrantVectorStore.fromDocuments(docOutput, embeddings, {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: "code_context",
      });
      return NextResponse.json({
        success: true,
        message: `Successfully indexed ${docOutput.length} chunks from ${fileName}`,
        chunks: docOutput.length,
      });
    } catch (dbError: any) {
      console.error("Qdrant connection error:", dbError);
      
      // Handle dimension mismatch specifically
      if (dbError.message?.includes("dimension") || dbError.message?.includes("vector size")) {
        return NextResponse.json({
          success: false,
          message: "Vector dimension mismatch. You migrated to a new embedding model! Please delete your old Qdrant collection ('code_context') and try again.",
          error: dbError.message
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        message: `Failed to connect to Qdrant vector database. Is it running? Error: ${dbError.message}`,
        chunksGenerated: docOutput.length,
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
