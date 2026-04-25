import express from "express";
import {
  createRole,
  getAllRole,
  getRoleById,
  updateRole,
  deleteRoleById,
} from "../controllers/role.controller.js";
import {
  validateParams,
  validateBody,
} from "../middleware/validate.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../schemas/role.schema.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo("admin"),
  validateBody(createRoleSchema),
  createRole,
);

router.get("/", authenticateJwt, restrictTo("admin"), getAllRole);

router.get(
  "/:roleId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("roleId")),
  getRoleById,
);

router.put(
  "/:roleId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("roleId")),
  validateBody(updateRoleSchema),
  updateRole,
);

router.delete(
  "/:roleId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("roleId")),
  deleteRoleById,
);

export default router;
