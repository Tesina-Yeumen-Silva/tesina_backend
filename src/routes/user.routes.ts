import { Router } from "express";
import { createUser,getAllUser,getUserByEmail,getUserById,updatePasword,updateUser,deleteUserById } from "../controllers/user.controller.js";

const router = Router();

router.post(
    '/',
    createUser
)

router.get(
    '/',
    getAllUser
)

router.get(
    '/:userId',
    getUserById
)

router.get(
    '/:email/email',
    getUserByEmail
)

router.put(
    '/:userId',
    updateUser
)

router.put(
    '/:userId/password',
    updatePasword
)

router.delete(
    '/:userId',
    deleteUserById
)

export default router;