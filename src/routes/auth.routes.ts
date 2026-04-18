import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validateLocalAuthLogin, validateLocalAuthRegister } from "../middleware/Validators/auth.validator.js";
import passport from "../config/passport.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateLocalAuthRegister, authController.registerLocalController);
router.post("/login", validateLocalAuthLogin, authController.loginLocalController);
router.post("/refresh", authController.refreshTokenController);
router.post("/logout", authenticateJwt, authController.logoutController);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"], session: false })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/google/failed", session: false }),
    authController.googleCallbackController 
);

router.get("/google/failed", authController.googleFailedController); 

export default router;