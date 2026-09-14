import { Router } from "express";
import {
  registerLocal,
  confirmRegister,
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
import { authLimiter, apiLimiter } from "../config/rateLimit.js";
import {
  registerLocalSchema,
  confirmRegisterSchema,
  loginLocalSchema,
  tokenSchema,
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
} from "../schemas/auth.schema.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication, session management, and password recovery
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Initiates the local registration process by validating user details and sending a verification code to the provided email address.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "Secret123!"
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: "Juan Pérez"
 *               roleId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Registration code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Registration code sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     signupToken:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post(
  "/register",
  authLimiter,
  validateBody(registerLocalSchema),
  registerLocal,
);

/**
 * @swagger
 * /auth/register/confirm:
 *   post:
 *     summary: Confirm registration
 *     description: Verifies the email confirmation code and signup token to complete user registration.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - signupToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *               signupToken:
 *                 type: string
 *                 example: "eyJhbGciOi..."
 *     responses:
 *       201:
 *         description: Registration confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Registration confirmed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         name:
 *                           type: string
 *                           example: "Juan Pérez"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *       400:
 *         description: Invalid or expired code / Validation error
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post(
  "/register/confirm",
  authLimiter,
  validateBody(confirmRegisterSchema),
  confirmRegister,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with local credentials
 *     description: Authenticates a user with email and password, returning JWT access and refresh tokens.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Secret123!"
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         name:
 *                           type: string
 *                           example: "Juan Pérez"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post("/login", authLimiter, validateBody(loginLocalSchema), loginLocal);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOi..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOi..."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post("/refresh", apiLimiter, validateBody(tokenSchema), refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Invalidates the provided refresh token and closes the session.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOi..."
 *     responses:
 *       200:
 *         description: Session closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Session closed successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/logout", apiLimiter, validateBody(tokenSchema), logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset verification code to the registered email address.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(requestPasswordResetSchema),
  requestPasswordReset,
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Confirm password reset
 *     description: Resets the user password using the verification code received by email.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid or expired code / Validation error
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post(
  "/reset-password",
  authLimiter,
  validateBody(confirmPasswordResetSchema),
  confirmPasswordReset,
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     description: Initiates the OAuth2 flow with Google. Redirects the user to Google's consent screen.
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: redirect_uri
 *         schema:
 *           type: string
 *         description: Optional frontend URL to redirect to after successful authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get("/google", (req, res, next) => {
  const redirectUri = req.query.redirect_uri as string;

  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
    state: redirectUri,
  })(req, res, next);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google OAuth2, generating JWT tokens and redirecting to the frontend.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirects to frontend with tokens as query parameters
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failed",
    session: false,
  }),
  googleCallback,
);

/**
 * @swagger
 * /auth/google/failed:
 *   get:
 *     summary: Google authentication failure
 *     description: Failure redirect endpoint when Google OAuth authentication fails.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       401:
 *         description: Error authenticating with Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error authenticating with Google
 */
router.get("/google/failed", googleFailed);

export default router;
