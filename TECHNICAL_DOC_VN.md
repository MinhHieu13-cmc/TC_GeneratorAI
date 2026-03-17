# Tài liệu Kĩ thuật - TC_Gener

Dự án TC_Gener là một công cụ tạo Test Case tự động dựa trên ngữ cảnh (Context-Aware Test Case Generator), sử dụng công nghệ RAG (Retrieval-Augmented Generation) để hiểu mã nguồn và tài liệu của bạn.

## 1. Công nghệ Sử dụng (Tech Stack)

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI UI**: [Vercel AI SDK (UI)](https://sdk.vercel.ai/docs/api-reference/use-chat) - Xử lý streaming và quản lý trạng thái chat.

### Backend & AI
- **LLM**: [Google Gemini 2.5 Flash](https://aistudio.google.com/) - Model chính xử lý ngôn ngữ và tạo mã nguồn test.
- **Embeddings**: `gemini-embedding-001` - Chuyển đổi văn bản thành vector để tìm kiếm ngữ cảnh.
- **Vector Database**: [Qdrant](https://qdrant.tech/) - Lưu trữ và truy vấn vector hiệu quả cao.
- **Orchestration**: [LangChain](https://js.langchain.com/) - Quản lý luồng RAG, kết nối Vector Store và xử lý tài liệu.
- **PDF Parsing**: `pdfjs-dist` - Trích xuất văn bản từ các tệp tài liệu PDF.

---

## 2. Luồng Hoạt động (Workflow)

Hệ thống hoạt động qua hai pha chính: **Ingestion (Nạp dữ liệu)** và **Generation (Tạo Test Case)**.

### A. Luồng Nạp dữ liệu (Ingestion Flow)
1. **Upload**: Người dùng tải lên mã nguồn (.ts, .js) hoặc tài liệu (.pdf) qua giao diện.
2. **Processing**: API `/api/ingest` nhận tệp tin.
   - Nếu là PDF, sử dụng `pdfjs-dist` để trích xuất văn bản.
   - Văn bản được chia nhỏ thành các đoạn (chunks) để tối ưu hóa việc tìm kiếm.
3. **Embedding**: Từng đoạn văn bản được gửi tới Google Gemini API (`gemini-embedding-001`) để tạo vector 3072 chiều.
4. **Storage**: Các vector này cùng với nội dung gốc được lưu vào bộ sưu tập `code_context` trong Qdrant.

### B. Luồng Tạo Test Case (Generation Flow - RAG)
1. **Request**: Người dùng nhập yêu cầu (ví dụ: "Viết unit test cho hàm login").
2. **Retrieval**: API `/api/generate` thực hiện:
   - Chuyển câu hỏi của người dùng thành vector (embedding).
   - Thực hiện **Similarity Search** trên Qdrant để tìm 3 đoạn ngữ cảnh liên quan nhất.
3. **Augmentation**: Kết hợp yêu cầu của người dùng với ngữ cảnh vừa tìm được vào một **System Prompt** chuyên gia QA.
4. **Generation**: Gửi Prompt tổng hợp tới Gemini 2.5 Flash.
5. **Streaming**: Phản hồi được stream trực tiếp về giao diện người dùng theo thời gian thực (Server-Sent Events) thông qua Vercel AI SDK.

---

## 3. Cấu trúc Thư mục Chính
- `/src/app/api/ingest`: Xử lý logic nạp và vector hóa dữ liệu.
- `/src/app/api/generate`: Xử lý logic RAG và gọi LLM.
- `/src/components`: Chứa các thành phần UI (Chat, File Upload).
- `/public/workers`: Chứa worker xử lý PDF để không làm treo luồng chính.

---

## 4. Biến môi trường Cần thiết
- `GOOGLE_GENERATIVE_AI_API_KEY`: API Key từ Google AI Studio.
- `QDRANT_URL`: Địa chỉ server Qdrant (mặc định localhost:6333).
