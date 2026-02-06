# Battleship Game - Premium Tactical Combat

Trò chơi Hải chiến (Battleship) phiên bản cao cấp với giao diện hiện đại, hỗ trợ chơi Online (PvP) và đấu với máy (PvE), được tối ưu hóa cho trải nghiệm mượt mà và tính cạnh tranh cao.

## Hình ảnh trang web

<img width="1846" height="1002" alt="image" src="https://github.com/user-attachments/assets/4140d4ff-2ca5-472d-b46f-e1ad9c5d7eb0" />

<img width="1862" height="1003" alt="image" src="https://github.com/user-attachments/assets/1e7d5c66-a09d-478f-8e13-578cb0b714a8" />

## Tính năng nổi bật

- **Chế độ chơi đa dạng**: 
  - **PvP (Online)**: Tham gia hoặc tạo phòng để đấu với người chơi khác toàn thế giới.
  - **PvE (Ghost AI)**: Luyện tập kỹ năng với trí tuệ nhân tạo được mô phỏng.
- **Dàn trận chiến thuật**: Lưới 10x10 với hệ thống kéo-thả, xoay tàu và triển khai tự động.
- **Chiến trường thời gian thực**: 
  - Hệ thống nhật ký chiến đấu (Battle Log) chi tiết.
  - Hiệu ứng âm thanh chân thực (Bắn trúng, trượt, chìm tàu, chiến thắng).
  - Đồng hồ đếm ngược lượt đi (30s) và tự động khai hỏa nếu quá giờ.
- **Hệ thống theo dõi**: 
  - Bảng xếp hạng (Leaderboard) theo thời gian thực.
  - Thống kê độ chính xác, số tàu đã hạ và thế trận (Momentum).
- **Giao diện cao cấp**: Thiết kế phong cách Dark Theme, Glassmorphism và micro-animations.

## Công nghệ sử dụng

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Socket.io (Real-time communication).
- **Ngôn ngữ**: TypeScript & JavaScript.


##  Cấu trúc thư mục

```text
battleship/
├── client/           # Mã nguồn Frontend (Next.js)
│   ├── app/          # Các trang (Lobby, Placement, Battle)
│   ├── components/   # Các thành phần giao diện
│   └── context/      # Quản lý trạng thái (Game, Socket, Language)
├── server/           # Mã nguồn Backend (Socket.io)
│   └── index.js      # Logic xử lý phòng và trận đấu
└── README.md         # Hướng dẫn này
```

---
**Phát triển bởi Terisc(linh0526) với ❤️**
