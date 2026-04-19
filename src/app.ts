import express from 'express';
import cors from 'cors';
import passport from "./config/passport.js";
import roleRouter from './routes/role.routes.js';
import authRouter from './routes/auth.routes.js';


const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use("/role",roleRouter);
app.use("/auth",authRouter);


export default app;