# Hướng dẫn sử dụng: Context-Aware Test Case Generator

Chào mừng bạn đến với **AutoQA AI** - Hệ thống tạo Test Case thông minh dựa trên ngữ cảnh mã nguồn của bạn.

## 🚀 Giới thiệu
Ứng dụng này sử dụng sức mạnh của **Google Gemini 2.5 Flash** và chiến lược **RAG (Retrieval-Augmented Generation)** để hiểu mã nguồn của bạn và tạo ra các bộ kiểm thử (unit tests) chính xác, hiện đại và đã được mock đầy đủ các thành phần phụ thuộc.

---

## 🛠 Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên.
- **Docker**: Để chạy Qdrant (Vector Database).
- **Google AI API Key**: Để sử dụng mô hình Gemini.

---

## ⚙️ Cấu hình ban đầu

1. **Tạo file môi trường**:
   Mở file `.env.local` trong thư mục gốc và đảm bảo bạn đã điền API Key của mình:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   QDRANT_URL=http://localhost:6333
   ```

2. **Khởi chạy Vector Database**:
   Sử dụng Docker Compose để chạy Qdrant:
   ```bash
   docker-compose up -d
   ```

3. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

---

## 🖥 Cách khởi chạy ứng dụng

Chạy lệnh sau để bắt đầu chế độ phát triển:
```bash
npm run dev
```
Sau đó, truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 📖 Hướng dẫn sử dụng

### Bước 1: Cung cấp ngữ cảnh (Ingest Context)
Tại cột bên trái "**1. Ingest Context**":
- Kéo và thả hoặc nhấp để tải lên các file mã nguồn (`.ts`, `.tsx`, `.js`, `.py`, ...) hoặc tài liệu API.
- Hệ thống sẽ tự động phân tách code (chunking), tạo vector embedding bằng mô hình `text-embedding-001` của Google và lưu vào Qdrant.

### Bước 2: Yêu cầu tạo Test Case
Tại cột bên phải "**2. Generate Tests**":
- Nhập mô tả về loại test case bạn cần vào khung chat.
- **Ví dụ**: *"Viết unit test cho function handleLogin trong module auth sử dụng Vitest."*
- Hệ thống sẽ tự động tìm kiếm ngữ cảnh liên quan nhất từ mã nguồn bạn đã tải lên và yêu cầu Gemini 2.5 Flash viết code.

### Bước 3: Nhận kết quả
- Code test sẽ được hiển thị theo thời gian thực (streaming).
- Các thành phần phụ thuộc (API, Database) sẽ được tự động **mock** để đảm bảo test chạy độc lập.

---

## 💡 Lưu ý quan trọng
- **Tính chính xác**: Luôn kiểm tra lại code test được tạo ra để đảm bảo nó phù hợp hoàn toàn với cấu trúc dự án thực tế của bạn.
- **Bảo mật**: Đừng bao giờ chia sẻ công khai file `.env.local` chứa API Key của bạn.
- **Qdrant**: Nếu bạn gặp lỗi khi tải file, hãy kiểm tra xem Docker Qdrant đã đang chạy hay chưa.

---

Chúc bạn có trải nghiệm tuyệt vời với AutoQA AI!
