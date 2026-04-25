import { Router } from "express";
import { createState,getAllStates,getStateById,updateState,deleteStateById } from "../controllers/reportState.controller.js";
import { createStateSchema, updateStateSchema } from "../schemas/state.schema.js";
import { validateBody,validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";

const router = Router();

router.post(
    '/',
    validateBody(createStateSchema),
    createState
)

router.get(
    '/',
    getAllStates
)

router.get(
    '/:stateId',
    validateParams(generateIdSchema("stateId")),
    getStateById
)

router.put(
    '/:stateId',
    validateParams(generateIdSchema("stateId")),
    validateBody(updateStateSchema),
    updateState
)

router.delete(
    '/:stateId',
    validateParams(generateIdSchema("stateId")),
    deleteStateById
)



export default router;