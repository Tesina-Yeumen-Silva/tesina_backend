import express from 'express';
import roleController from '../controllers/role.controller.js';
import { validateNumericId } from '../middleware/Validators/validationHelper.js';
import { validateRole } from '../middleware/Validators/role.validator.js';

const router = express.Router();

router.post(
    '/',
    validateRole,
    roleController.createRole
)

router.get(
    '/',
    roleController.getAllRole
)

router.get(
    '/:roleId',
    validateNumericId('roleId'),
    roleController.getRoleById
)

router.put(
    '/:roleId',
    validateNumericId('roleId'),
    validateRole,
    roleController.updateRole
)

router.delete(
    '/:roleId',
    validateNumericId('roleId'),
    roleController.deleteRoleById
)

export default router;