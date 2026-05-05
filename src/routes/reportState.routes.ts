import { Router } from "express";
import {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteStateById,
} from "../controllers/reportState.controller.js";
import {
  createStateSchema,
  updateStateSchema,
} from "../schemas/state.schema.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateBody(createStateSchema),
  createState,
);

router.get(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  getAllStates,
);

router.get(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  validateParams(generateIdSchema("stateId")),
  getStateById,
);

router.put(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  validateBody(updateStateSchema),
  updateState,
);

router.delete(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  deleteStateById,
);

export default router;
