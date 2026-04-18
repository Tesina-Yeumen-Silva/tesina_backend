import { Router } from "express";
import authController from "../controllers/authController.js";
import { validateLocalAuth } from "../middleware/Validators/authValidation/localAuthValidation.js";

const router = Router();

router.post(
    "/register",
    validateLocalAuth,
    authController.registerLocalController
);

router.post(
    "/login",
    validateLocalAuth,
    authController.loginLocalController
)

export default router;