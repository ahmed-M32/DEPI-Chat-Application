# 💬 NexChat — Real-Time Messaging Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socketdotio&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> A modern, secure real-time messaging platform with private chats, group conversations, media sharing, and end-to-end message encryption.

🔗 **[Live Demo](https://your-vercel-url.app)** &nbsp;|&nbsp; 📸 **[Screenshots](#screenshots)**

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT stored in HttpOnly cookies, protected against XSS attacks
- ⚡ **Real-time Messaging** — Instant delivery via Socket.IO with no page refresh
- 🔒 **Message Encryption** — Messages encrypted at rest for privacy
- 👤 **Private Chats** — One-on-one conversations with any user
- 👥 **Group Chats** — Create and manage group conversations with multiple participants
- 🖼️ **Media Sharing** — Image uploads and sharing via Cloudinary
- 🟢 **User Presence** — Live online/offline status indicators
- ✍️ **Typing Indicators** — See when someone is typing in real time
- 📬 **Unread Counts** — Track unread messages per conversation
- 📱 **Responsive Design** — Works seamlessly on mobile and desktop

---

## 📸 Screenshots

### Sign Up
![Sign Up](https://raw.githubusercontent.com/ahmed-M32/DEPI-Chat-Application/refs/heads/main/screenshots/Screenshot%202025-05-09%20140253.png)

### Main Chat Interface
![Chat](https://raw.githubusercontent.com/ahmed-M32/DEPI-Chat-Application/refs/heads/main/screenshots/Screenshot%202025-05-09%20140322.png)

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — UI with hooks and Context API for state management
- **Socket.IO Client** — Real-time bidirectional communication
- **Axios** — HTTP requests with cookie-based auth
- **CSS Modules** — Scoped, responsive styling

### Backend
- **Node.js + Express.js** — REST API and server logic
- **MongoDB + Mongoose** — Data modeling and persistence
- **Socket.IO** — WebSocket server for real-time events
- **JWT + HttpOnly Cookies** — Secure, XSS-resistant authentication
- **Cloudinary** — Cloud image storage and transformation
- **bcryptjs** — Password hashing

---


## 📁 Project Structure

```
nexchat/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── socket/           # Socket.IO logic
│   ├── middleware/        # Auth middleware
│   └── lib/              # Utilities (JWT, Cloudinary, crypto)
└── frontend/
    ├── src/
    │   ├── api/          # Axios API calls
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React Context (Auth, Socket)
    │   ├── pages/        # Page components
    │   └── hooks/        # Custom hooks
```

---

