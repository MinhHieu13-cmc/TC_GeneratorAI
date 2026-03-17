"use client";

import { useState } from "react";
import { UploadCloud, FileType, CheckCircle, AlertCircle } from "lucide-react";

export default function FileUploader({ onUploadSuccess }: { onUploadSuccess: (msg: string) => void }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => setIsHovering(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Upload failed");
      
      onUploadSuccess(data.message || `Successfully analyzed ${file.name}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-out 
        ${
          isHovering
            ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
            : "border-gray-700 bg-gray-800/40 hover:border-gray-500"
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.md,.txt"
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center cursor-pointer space-y-4"
      >
        <span className="p-4 rounded-full bg-blue-500/20 text-blue-400">
          <UploadCloud className="w-8 h-8" />
        </span>
        <span className="block">
          <span className="block text-lg font-medium text-gray-200">
            {isUploading ? "Analyzing & Embedding..." : "Upload Code or Documentation"}
          </span>
          <span className="block text-sm text-gray-400 mt-1">
            Drag and drop, or click to browse
          </span>
        </span>
      </label>

      {error && (
        <div className="mt-4 flex items-center justify-center text-red-400 text-sm space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
