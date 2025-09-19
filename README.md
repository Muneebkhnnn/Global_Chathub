# 💬 Global ChatHub

A modern, real-time chat application built with **React**, **Node.js**, **Socket.io**, and **MongoDB**. Features include real-time messaging, user authentication, email verification, file uploads, and responsive design.

![Chat App Banner](https://img.shields.io/badge/Chat-App-blue?style=for-the-badge&logo=react)

## ✨ Features

### 🔐 **Authentication & Security**
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality via email
- Protected routes and middleware
- Session management

### 💬 **Real-time Messaging**
- Instant messaging with Socket.io
- Online/offline user status
- Typing indicators
- Message history and persistence
- WhatsApp-like message layout (bottom-to-top)

### 👤 **User Management**
- User profiles with avatar upload (Cloudinary)
- Edit profile functionality
- User search and discovery
- Conversation management

### 🎨 **UI/UX**
- Responsive design (mobile & desktop)
- Modern dark theme
- Smooth animations and transitions
- Mobile-friendly sidebar overlay
- Tailwind CSS styling

### 🔔 **Notifications**
- Unread message indicators
- Real-time notifications with React Hot Toast
- Email notifications for verification/reset

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - UI Library
- **Redux Toolkit** - State Management
- **React Router DOM** - Routing
- **Socket.io Client** - Real-time Communication
- **Tailwind CSS** - Styling
- **Vite** - Build Tool
- **Axios** - HTTP Client

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Socket.io** - Real-time Communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Cloudinary** - File Storage
- **Resend** - Email Service

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)
- **Cloudinary Account** (for file uploads)
- **Resend Account** (for emails)

### **1. Clone the Repository**
```bash
git clone <https://github.com/Muneebkhnnn/Global_Chathub.git>
cd Chat-App
```

### **2. Install Dependencies**

**Root (for server):**
```bash
npm install
```

**Client:**
```bash
cd client
npm install
cd ..
```

### **3. Environment Setup**

**Root `.env` (Server):**
```bash
# Database
MONGODB_URI="mongodb://localhost:27017/chatapp"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRY="your expiry limit"

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Brevo (Email Service)
BREVO="your-brevo-api-key" 
FROM_EMAIL="noreply@yourdomain.com"

# Server
PORT=3000
CLIENT_URL="http://localhost:5173"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

**Client `.env`:**
```bash
# API Base URL
VITE_DB_URL="http://localhost:3000/api/v1"
VITE_DB_ORIGIN="http://localhost:3000"
```

### **4. Start the Application**

**Development Mode:**

```bash
# Terminal 1 - Start Server
npm run dev

# Terminal 2 - Start Client  
cd client
npm run dev
```

**Production Mode:**
```bash
# Build client
cd client
npm run build
cd ..

# Start server
npm start
```

### **5. Access the Application**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000


## 📱 Usage Guide

### **Getting Started**

1. **Sign Up**
   - Create account with email, username, password
   - Check email for verification link
   - Verify your account

2. **Login**
   - Use email/username and password
   - Stay logged in with JWT tokens

3. **Start Chatting**
   - Browse users in sidebar
   - Click on any user to start conversation
   - Send real-time messages
   - See typing indicators and online status

### **Key Features Usage**

**Profile Management:**
- Click profile icon → Edit Profile
- Upload new avatar (images auto-uploaded to Cloudinary)
- Update username and full name

**Password Reset:**
- Forgot Password on login page
- Enter email → Check inbox
- Click reset link → Set new password

**Mobile Experience:**
- Responsive design works on all devices
- Mobile sidebar overlay for conversations
- Touch-friendly interface

## 🏗️ Project Structure

```
Chat-App/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── home/      # Chat interface
│   │   │   ├── login/     # Authentication
│   │   │   └── Signup/    # Registration
│   │   └── store/         # Redux store
│   │       └── slice/     # Redux slices
├── server/                # Node.js Backend
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Custom middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── socket/           # Socket.io logic
│   └── utils/            # Utility functions
└── README.md
```

## 🔧 Available Scripts

### **Server Scripts**
```bash
npm run dev     # Start with nodemon (development)
npm start       # Start production server
```

### **Client Scripts**
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## 🔒 Environment Variables

### **Required Server Variables**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_*` - Cloudinary credentials
- `RESEND_API_KEY` - Email service API key

### **Required Client Variables**
- `VITE_DB_URL` - Backend API URL
- `VITE_DB_ORIGIN` - Backend origin for requests

## 🚨 Troubleshooting

### **Common Issues**

**1. CORS Errors**
```bash
# Ensure CORS_ORIGIN matches client URL
CORS_ORIGIN="http://localhost:5173"
```

**2. Socket Connection Issues**
```bash
# Check client and server URLs match
# Verify no firewall blocking ports 3000/5173
```

**3. File Upload Errors**
```bash
# Verify Cloudinary credentials
# Check file size limits in multer config
```

**4. Email Not Sending**
```bash
# Verify Resend API key
# Check FROM_EMAIL is verified domain
```

**5. Database Connection**
```bash
# Ensure MongoDB is running
# Check MONGODB_URI format
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Socket.io** for real-time communication
- **Cloudinary** for file storage
- **Resend** for email services
- **Tailwind CSS** for styling
- **React** ecosystem for frontend

---

**Built with ❤️ by [Muneeb khan]**

For support or questions, please open an issue or contact [muneebkhn0786@gmail.com]