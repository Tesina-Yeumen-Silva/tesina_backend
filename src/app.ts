import express from 'express';
import cors from 'cors';
import roleRouter from './routes/rolesRoutes.js';
import authRouter from './routes/authRoutes.js';


const app = express();

app.use(express.json());
app.use(cors());
app.use("/role",roleRouter);
app.use("/auth",authRouter);


export default app;