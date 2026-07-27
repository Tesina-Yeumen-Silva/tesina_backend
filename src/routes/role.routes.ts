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
import { apiLimiter } from "../config/rateLimit.js";

const router = express.Router();

router.use(authenticateJwt);
router.use(apiLimiter);

router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  validateBody(createRoleSchema),
  createRole,
);

router.get("/", restrictTo(ROLES.ADMIN, ROLES.MUNI), getAllRole);

router.get(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  getRoleById,
);

router.put(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  validateBody(updateRoleSchema),
  updateRole,
);

router.delete(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  deleteRoleById,
);

export default router;
