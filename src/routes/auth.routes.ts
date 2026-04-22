import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validateLocalAuthLogin, validateLocalAuthRegister } from "../middleware/Validators/auth.validator.js";
import passport from "../config/passport.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateLocalAuthRegister, authController.registerLocal);
router.post("/login", validateLocalAuthLogin, authController.loginLocal);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authenticateJwt, authController.logout);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"], session: false })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/google/failed", session: false }),
    authController.googleCallback 
);

router.get("/google/failed", authController.googleFailed); 

export default router;