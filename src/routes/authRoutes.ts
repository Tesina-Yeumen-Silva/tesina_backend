import { Router } from "express";
import authController from "../controllers/authController.js";
import { validateLocalAuth } from "../middleware/Validators/authValidation/localAuthValidation.js";
import passport from "../config/passport.js";

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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/google/failed", session: false }),
  (req, res) => {
    const user = req.user as any;
    res.redirect(`http://localhost:5173?token=${user.token}`);
  }
);

router.get("/google/failed", (_req, res) => {
  res.status(401).json({ message: "Error authenticating with Google" });
});

export default router;