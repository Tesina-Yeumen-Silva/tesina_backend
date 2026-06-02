import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import roleRouter from "./routes/role.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import reportCategoryRouter from "./routes/reportCategory.routes.js";
import reportStateRouter from "./routes/reportState.routes.js";
import reportRouter from "./routes/report.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

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

app.use(errorHandler);

export default app;
