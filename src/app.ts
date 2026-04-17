import express from 'express';
import cors from 'cors';
import roleRouter from './routes/rolesRoutes.js';


const app = express();

app.use(express.json());
app.use(cors());
app.use("/role",roleRouter);


export default app;