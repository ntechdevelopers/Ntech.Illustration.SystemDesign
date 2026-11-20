# Ntech Illustration System Design — Interactive Course

Hệ thống học và mô phỏng trực quan **System Design (Thiết kế hệ thống)** tương tác 1:1 theo phong cách và công nghệ của [designed-to-scale.vercel.app](https://designed-to-scale.vercel.app/), được tái cấu trúc hoàn chỉnh bằng **React + TypeScript (Frontend)** và **Node.js Express (Backend)**, hỗ trợ đầy đủ 2 ngôn ngữ: **Tiếng Anh (English)** và **Tiếng Việt**.

---

## 🚀 Tính năng nổi bật

1. **Giao diện & Mô phỏng Isometric SVG chính xác 100%**:
   - Sử dụng engine đồ họa isometric projection chân thực: các khối server, balancer, database, queue, cache, crowd người dùng.
   - Luồng chuyển động hạt (packet particles) animated theo thời gian thực (request, response, ping, push, write, heavy work, fail).
   - Chế độ điều khiển đầy đủ: **Tạm dừng / Tiếp tục** (`Space`), **Xem lại bước** (`R`), **Fit khung hình** (`0`), **Phóng to toàn màn hình**.
   - Hỗ trợ cả 2 giao diện: **Dark Mode (Tối)** và **Light Mode (Sáng)** lưu trạng thái vào `localStorage`.

2. **Hỗ trợ 2 ngôn ngữ (Song ngữ EN / VI)**:
   - Toàn bộ nội dung của **40 bài học**, **9 module**, giải thích từng bước, diffs thay đổi (`+`, `~`, `-`), metrics kỹ thuật, và giao diện UI đều được dịch chuẩn xác sang tiếng Việt.
   - Nút chuyển đổi ngôn ngữ nhanh trên thanh Topbar (EN / VI).

3. **Kiến trúc rõ ràng (FE + BE)**:
   - **Backend**: Dịch vụ API Express phục vụ dữ liệu tĩnh (Static JSON) về bài học, từ điển ngôn ngữ, tìm kiếm (`search`), và lưu tiến độ học tập (`progress`). Dễ dàng mở rộng kết nối Database (MongoDB, PostgreSQL...) sau này.
   - **Frontend**: Single Page Application bằng **React 18 + TypeScript + Vite**. Có cơ chế fallback tự động đọc dữ liệu offline từ `/public/data` nếu Backend chưa chạy.

---

## 📁 Cấu trúc thư mục

```
Ntech.Illustration.SystemDesign/
├── package.json                         # Scripts chạy cả monorepo
├── backend/                             # Dịch vụ Backend (Express + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                     # Express server (cổng 3001)
│   │   ├── routes/
│   │   │   └── api.ts                   # Router API endpoints
│   │   └── controllers/
│   │       ├── curriculum.controller.ts # API danh mục 9 module
│   │       ├── lessons.controller.ts    # API chi tiết 40 bài học (hỗ trợ ?lang=vi)
│   │       ├── i18n.controller.ts       # API từ điển UI (en.json, vi.json)
│   │       ├── search.controller.ts     # Tìm kiếm bài học & khái niệm
│   │       └── progress.controller.ts   # Lưu tiến độ học tập của người dùng
│   └── data/                            # Kho dữ liệu JSON tĩnh
│       ├── curriculum.json              # Cấu trúc 9 module
│       ├── i18n/                        # en.json, vi.json
│       ├── lessons/                     # 40 file JSON bài học
│       └── translations/                # 40 file dịch nghĩa tiếng Việt
│
└── frontend/                            # Giao diện Frontend (React + Vite + TS)
    ├── package.json
    ├── vite.config.ts                   # Proxy /api sang http://localhost:3001
    ├── index.html                       # HTML entry point, dark mode init
    ├── public/
    │   ├── favicon.svg
    │   └── data/                        # Static fallback data (chạy độc lập)
    └── src/
        ├── index.css                    # Toàn bộ CSS gốc, màu sắc & typography JetBrains Mono
        ├── main.tsx                     # Entry point React
        ├── App.tsx                      # Component chính, quản lý URL hash, keyboard shortcuts
        ├── api/client.ts                # Client API kết nối BE (kèm offline fallback)
        ├── context/
        │   ├── LanguageContext.tsx      # Quản lý ngôn ngữ (en / vi)
        │   └── ThemeContext.tsx         # Quản lý giao diện (dark / light)
        ├── engine/
        │   ├── Stage.js                 # Engine mô phỏng SVG Isometric tương tác
        │   ├── Stage.d.ts               # Định nghĩa TypeScript cho Stage
        │   └── icons.js                 # Bộ icon SVG vector
        └── components/
            ├── Topbar.tsx               # Header, logo, nút tìm kiếm, đổi ngôn ngữ, dark/light
            ├── Sidebar.tsx              # Drawer danh sách 9 module & 40 bài học
            ├── StageView.tsx            # Khung canvas hiển thị diagram & các nút điều khiển
            ├── TimelineBar.tsx          # Thanh timeline các bước (Prev / Next / Dots)
            ├── GuidePanel.tsx           # Khung giải thích chi tiết bước hiện tại, diffs, metrics
            ├── GoalsPanel.tsx           # Mục tiêu bài học & checklist
            └── SearchModal.tsx          # Hộp thoại tìm kiếm nhanh (Ctrl+K)
```

---

## 🛠 Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt dependencies (chỉ cần chạy lần đầu)

Mở terminal tại thư mục `Ntech.Illustration.SystemDesign`:

```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### 2. Khởi chạy dự án

Có 2 cách khởi chạy:

#### Cách 1: Chạy song song cả Frontend và Backend (Khuyên dùng)

Mở 2 cửa sổ terminal:

* **Terminal 1 - Chạy Backend API (Port 3001)**:
  ```bash
  cd backend
  npm run dev
  ```

* **Terminal 2 - Chạy Frontend React (Port 3000)**:
  ```bash
  cd frontend
  npm run dev
  ```

Truy cập: **`http://localhost:3000`**

#### Cách 2: Chạy độc lập Frontend (Static mode)

Frontend đã được tích hợp sẵn toàn bộ dữ liệu tĩnh trong thư mục `frontend/public/data`. Bạn có thể chỉ cần chạy Frontend mà không bắt buộc phải mở Backend:

```bash
cd frontend
npm run dev
```

---

## ⌨️ Phím tắt (Keyboard Shortcuts)

* **`Space`**: Tạm dừng (Pause) / Tiếp tục (Resume) luồng dữ liệu mô phỏng.
* **`Phím mũi tên trái (←)`**: Lùi lại bước trước đó.
* **`Phím mũi tên phải (→)`**: Tiến tới bước kế tiếp.
* **`R`**: Chạy lại mô phỏng của bước hiện tại từ đầu (Replay).
* **`0`**: Căn chỉnh sơ đồ vừa vặn với màn hình (Fit).
* **`Ctrl + K` / `Cmd + K`**: Mở hộp thoại tìm kiếm bài học & khái niệm.
* **`Esc`**: Đóng hộp thoại tìm kiếm hoặc menu drawer.

---

## 📚 Danh mục 40 bài học (9 Modules)

1. **01 · Nền tảng (Foundations)**:
   - Hành trình của một yêu cầu (How a Request Travels)
   - Độ trễ & thông lượng (Latency & Throughput)
   - Tính nhẩm nhanh (Napkin Math)
2. **02 · Mở rộng (Scaling)**:
   - Dọc hay ngang (Vertical vs Horizontal)
   - Cân bằng tải (Load Balancing)
   - Dịch vụ phi trạng thái (Stateless Services)
   - Bộ nhớ đệm (Caching)
   - Phân phối nội dung (Content Delivery)
3. **03 · Dữ liệu & lưu trữ (Data & Storage)**:
   - SQL hay NoSQL (SQL vs NoSQL)
   - Chỉ mục (Indexes)
   - Storage Engines
   - Sao chép dữ liệu (Replication)
   - Sharding
   - Consistent Hashing
   - ID duy nhất ở quy mô lớn (Unique IDs at Scale)
   - CAP & tính nhất quán (CAP & Consistency)
   - Đồng thuận & leader (Consensus & Leaders)
   - Giao dịch & cô lập (Transactions & Isolation)
   - Tệp & đa phương tiện (Files & Media)
4. **04 · Giao tiếp (Communication)**:
   - REST, RPC & GraphQL
   - Hàng đợi tin nhắn (Message Queues)
   - Pub/Sub & sự kiện (Pub/Sub & Events)
   - Cập nhật thời gian thực (Real-time Updates)
5. **05 · Độ tin cậy (Reliability)**:
   - Dự phòng & failover (Redundancy & Failover)
   - Giới hạn tốc độ (Rate Limiting)
   - Timeout & thử lại (Timeouts & Retries)
   - Khả năng quan sát (Observability)
6. **06 · Kiến trúc (Architecture)**:
   - Monolith hay Microservices
   - Khám phá dịch vụ (Service Discovery)
   - Sagas & giao dịch phân tán (Sagas & Distributed Tx)
   - Xử lý theo lô & luồng (Batch & Stream Processing)
7. **07 · Bảo mật (Security)**:
   - Xác thực (Authentication)
   - Phân quyền (Authorization)
   - Mã hóa & bí mật (Encryption & Secrets)
8. **08 · Phát hành (Shipping)**:
   - Kiểm thử (Testing)
   - CI/CD & triển khai (CI/CD & Deployments)
9. **09 · Hệ thống hoàn chỉnh (Whole Systems)**:
   - HLD & LLD
   - Thiết kế dịch vụ rút gọn URL (Design a URL Shortener)
   - Thiết kế News Feed (Design a News Feed)
   - Thiết kế một hệ thống Chat (Design a Chat System)

