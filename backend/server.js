import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'; 
import AuthRouter from './routes/auth.routes.js';
import UserRouter from './routes/user.routes.js';
import { connectDb } from './utils/connectDb.js';

dotenv.config();
await connectDb();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/auth',AuthRouter);
app.use('/user', UserRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});