import { Router } from "express";
import {
  createUser,
  getAllUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  updateUser,
  deleteUserById,
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
} from "../schemas/user.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo("admin"),
  validateBody(createUserSchema),
  createUser,
);

router.get("/", authenticateJwt, restrictTo("admin"), getAllUser);

router.get(
  "/:userId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("userId")),
  getUserById,
);

router.get(
  "/email/:email",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(emailParamSchema),
  getUserByEmail,
);

router.put(
  "/:userId",
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
