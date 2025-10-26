import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Chat from './models/chatModels.js';
import { isAuth } from './middlewares/isAuth.js';
import { User } from './models/userModel.js';
import { app, server } from './socket/socket.js';
import path from 'path';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Server is up and running');
});



app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/message', messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("/.+", (req, res) => {
        res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});