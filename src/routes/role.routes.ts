import express from 'express';
import { createRole,getAllRole,getRoleById,updateRole,deleteRoleById } from '../controllers/role.controller.js';
import { validateNumericId } from '../middleware/Validators/validationHelper.js';
import { validateRole } from '../middleware/Validators/role.validator.js';

const router = express.Router();

router.post(
    '/',
    validateRole,
    createRole
)

router.get(
    '/',
    getAllRole
)

router.get(
    '/:roleId',
    validateNumericId('roleId'),
    getRoleById
)

router.put(
    '/:roleId',
    validateNumericId('roleId'),
    validateRole,
    updateRole
)

router.delete(
    '/:roleId',
    validateNumericId('roleId'),
    deleteRoleById
)

export default router;