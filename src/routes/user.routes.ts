import { Router } from "express";
import userController from "../controllers/user.controller.js";

const router = Router();

router.post(
    '/',
    userController.createUser
)

router.get(
    '/',
    userController.getAllUser
)

router.get(
    '/:userId',
    userController.getUserById
)

router.get(
    '/:email/email',
    userController.getUserByEmail
)

router.put(
    '/:userId',
    userController.updateUser
)

router.put(
    '/:userId/password',
    userController.updatePasword
)

router.delete(
    '/:userId',
    userController.deleteUserById
)

export default router;