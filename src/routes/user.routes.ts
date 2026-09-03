import { Router } from "express";
import {
  createUser,
  getAllUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  updateUser,
  deleteUserById,
  registerPushToken,
} from "../controllers/user.controller.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  emailParamSchema,
  registerPushTokenSchema,
} from "../schemas/user.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import { apiLimiter } from "../config/rateLimit.js";

const router = Router();

router.use(authenticateJwt);
router.use(apiLimiter);

router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  validateBody(createUserSchema),
  createUser,
);

router.post(
  "/push-token",
  validateBody(registerPushTokenSchema),
  registerPushToken,
);

router.get("/", restrictTo(ROLES.ADMIN, ROLES.OPERATOR), getAllUser);

router.get(
  "/:userId",
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("userId")),
  getUserById,
);

router.get(
  "/email/:email",
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(emailParamSchema),
  getUserByEmail,
);

router.put(
  "/:userId",
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("userId")),
  validateBody(updateUserSchema),
  updateUser,
);

router.put(
  "/:userId/password",
  validateParams(generateIdSchema("userId")),
  validateBody(updatePasswordSchema),
  updatePassword,
);

router.delete(
  "/:userId",
  validateParams(generateIdSchema("userId")),
  deleteUserById,
);

export default router;
