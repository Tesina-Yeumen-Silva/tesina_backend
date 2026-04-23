import express from 'express';
import { createRole,getAllRole,getRoleById,updateRole,deleteRoleById } from '../controllers/role.controller.js';
import { validateParams, validateBody } from '../middleware/validate.middleware.js';
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema.js';
import { generateIdSchema } from '../schemas/common.schema.js';

const router = express.Router();

router.post(
    '/',
    validateBody(createRoleSchema),
    createRole
)

router.get(
    '/',
    getAllRole
)

router.get(
    '/:roleId',
    validateParams(generateIdSchema("roleId")),
    getRoleById
)

router.put(
    '/:roleId',
    validateParams(generateIdSchema("roleId")),
    validateBody(updateRoleSchema),
    updateRole
)

router.delete(
    '/:roleId',
    validateParams(generateIdSchema("roleId")),
    deleteRoleById
)

export default router;