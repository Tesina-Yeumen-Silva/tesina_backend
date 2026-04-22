import { Router } from "express";
import { registerLocal,loginLocal,refreshToken,logout, googleCallback, googleFailed } from "../controllers/auth.controller.js";
import { validateLocalAuthLogin, validateLocalAuthRegister } from "../middleware/Validators/auth.validator.js";
import passport from "../config/passport.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateLocalAuthRegister, registerLocal);
router.post("/login", validateLocalAuthLogin, loginLocal);
router.post("/refresh", refreshToken);
router.post("/logout", authenticateJwt, logout);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"], session: false })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/google/failed", session: false }),
    googleCallback 
);

router.get("/google/failed", googleFailed); 

export default router;