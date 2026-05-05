import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import passport from "./config/passport.js";
import roleRouter from "./routes/role.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import reportCategoryRouter from "./routes/reportCategory.routes.js";
import reportStateRouter from "./routes/reportState.routes.js";
import reportRouter from "./routes/report.routes.js";
import { AppError } from "./utils/appError.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use("/roles", roleRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.use("/reports", reportRouter);

app.use("/report-categories", reportCategoryRouter);
app.use("/report-states", reportStateRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    res.status(401).json({
      status: "error",
      message: "Token inválido o expirado",
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
});

export default app;
