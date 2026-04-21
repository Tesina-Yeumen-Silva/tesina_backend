import { Router } from "express";
import reportStateController from "../controllers/reportState.controller.js";

const router = Router();

router.post(
    '/',
    reportStateController.createState
)

router.get(
    '/',
    reportStateController.getAllStates
)

router.get(
    '/:stateId',
    reportStateController.getStateById
)

router.put(
    '/:stateId',
    reportStateController.updateState
)

router.delete(
    '/:stateId',
    reportStateController.deleteStateById
)



export default router;