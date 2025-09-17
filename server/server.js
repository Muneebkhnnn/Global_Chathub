import {app,server} from "./socket/socket.js";
import express from "express";
import cors from "cors";
import connectDB from "./db/index.js"
import userRoutes from "./routes/user.routes.js";
import messageRoutes from './routes/message.routes.js'
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const PORT= process.env.PORT || 8000;

const allowedOrigins = [
  'https://global-chathub.vercel.app',
  'https://globalchathub.dev',
  'https://www.globalchathub.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    // Check if the requested origin is in our allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you are using cookies or sessions
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
connectDB();
app.use(cookieParser())

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/message', messageRoutes);


app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


