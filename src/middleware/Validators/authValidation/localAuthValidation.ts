import { body } from 'express-validator';
import { handleValidationErrors } from '../validationHelper.js';

export const validateLocalAuth = [
    body('email')
        .notEmpty().withMessage('email required')
        .isString().withMessage('string type'),
    body('password')
        .notEmpty().withMessage('password required')
        .isString().withMessage('string type'),
    handleValidationErrors
]