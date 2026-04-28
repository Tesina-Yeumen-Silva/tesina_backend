import { Router } from "express";
import {
  registerLocal,
  loginLocal,
  refreshToken,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  googleCallback,
  googleFailed,
} from "../controllers/auth.controller.js";
import passport from "../config/passport.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  registerLocalSchema,
  loginLocalSchema,
  tokenSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
} from "../schemas/auth.schema.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateBody(registerLocalSchema), registerLocal);
router.post("/login", validateBody(loginLocalSchema), loginLocal);
router.post(
  "/refresh",
  authenticateJwt,
  validateBody(tokenSchema),
  refreshToken,
);
router.post("/logout", authenticateJwt, validateBody(tokenSchema), logout);

router.post("/forgot-password",validateBody(requestPasswordResetSchema),requestPasswordReset)

router.post("/reset-password",validateBody(confirmPasswordResetSchema),confirmPasswordReset)

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failed",
    session: false,
  }),
  googleCallback,
);

router.get("/google/failed", googleFailed);

export default router;
