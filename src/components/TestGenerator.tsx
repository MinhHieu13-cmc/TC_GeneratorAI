"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User, Code2 } from "lucide-react";

export default function TestGenerator() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/generate" }),
  });
  
  const isLoading = status !== "ready";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const currentInput = input;
    setInput("");
    await sendMessage({ text: currentInput });
  };
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("UI DEBUG: Messages updated:", messages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-md p-4 border-b border-gray-700 flex items-center space-x-3">
        <Code2 className="text-blue-400 w-5 h-5" />
        <h2 className="font-semibold text-gray-200">Real-Time Test Generator</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p>Upload context above, then describe what test you need.</p>
            <p className="text-sm mt-2 opacity-50">Example: "Write a unit test for the handleLogin function in the auth module."</p>
          </div>
        ) : (
          messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex items-start space-x-4 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600/90 text-white rounded-tr-none"
                    : "bg-gray-800 border border-gray-700 text-gray-300 rounded-tl-none font-mono text-sm leading-relaxed"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {m.parts 
                    ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                    : m.content}
                </div>
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[85%] rounded-2xl p-4 bg-gray-800 border border-gray-700 text-gray-400 flex space-x-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
            value={input}
            placeholder="Describe the test case..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={!input || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 transition-colors flex items-center justify-center shadow-lg shadow-blue-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
