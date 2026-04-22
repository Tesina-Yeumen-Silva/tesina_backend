import { Router } from "express";
import { createState,getAllStates,getStateById,updateState,deleteStateById } from "../controllers/reportState.controller.js";

const router = Router();

router.post(
    '/',
    createState
)

router.get(
    '/',
    getAllStates
)

router.get(
    '/:stateId',
    getStateById
)

router.put(
    '/:stateId',
    updateState
)

router.delete(
    '/:stateId',
    deleteStateById
)



export default router;