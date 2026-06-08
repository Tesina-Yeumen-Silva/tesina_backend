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
import { apiLimiter } from "../config/rateLimit.js";

const router = Router();

router.use(authenticateJwt);
router.use(apiLimiter);

router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  validateBody(createStateSchema),
  createState,
);

router.get(
  "/",
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  getAllStates,
);

router.get(
  "/:stateId",
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  validateParams(generateIdSchema("stateId")),
  getStateById,
);

router.put(
  "/:stateId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  validateBody(updateStateSchema),
  updateState,
);

router.delete(
  "/:stateId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  deleteStateById,
);

export default router;
