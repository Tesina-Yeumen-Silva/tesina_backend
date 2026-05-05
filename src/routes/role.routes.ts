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
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateBody(createRoleSchema),
  createRole,
);

router.get("/", authenticateJwt, restrictTo(ROLES.ADMIN), getAllRole);

router.get(
  "/:roleId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  getRoleById,
);

router.put(
  "/:roleId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  validateBody(updateRoleSchema),
  updateRole,
);

router.delete(
  "/:roleId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  deleteRoleById,
);

export default router;
