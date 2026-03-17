"use client";
import FileUploader from "@/components/FileUploader";
import TestGenerator from "@/components/TestGenerator";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-gray-800/60 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                AutoQA AI
              </span>
            </div>
            <div className="text-sm font-medium text-gray-400 flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Context-Aware Test Case Generator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload your source code or API documentation to our vector-indexed ingestion pipeline.
            Then, watch in real-time as our AI streams perfect, fully-mocked unit tests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Ingestion) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">1. Ingest Context</h2>
              <FileUploader onUploadSuccess={(msg) => console.log(msg)} />
              
              <div className="mt-8 p-6 bg-gray-900/50 rounded-2xl border border-gray-800/60">
                <h3 className="font-medium text-sm text-gray-400 uppercase tracking-wider mb-4">How it works</h3>
                <ul className="space-y-4 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-mono bg-blue-500/10 px-2 py-0.5 rounded">01</span>
                    We chunk your code with overlapping text splitters.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-mono bg-blue-500/10 px-2 py-0.5 rounded">02</span>
                    Google Generative AI (text-embedding-001) creates dense vector embeddings.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-mono bg-blue-500/10 px-2 py-0.5 rounded">03</span>
                    Vectors are instantly searchable via our local Qdrant memory store.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Generation) */}
          <div className="col-span-1 lg:col-span-7">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">2. Generate Tests</h2>
            <TestGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}
