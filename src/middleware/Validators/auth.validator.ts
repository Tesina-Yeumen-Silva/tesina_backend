import { body } from 'express-validator';
import { handleValidationErrors } from './validationHelper.js';

export const validateLocalAuthLogin = [
    body('email')
        .notEmpty().withMessage('email required')
        .isString().withMessage('string type'),
    body('password')
        .notEmpty().withMessage('password required')
        .isString().withMessage('string type'),
    handleValidationErrors
]

export const validateLocalAuthRegister = [
    body('email')
        .notEmpty().withMessage('email required')
        .isString().withMessage('string type'),
    body('password')
        .notEmpty().withMessage('password required')
        .isString().withMessage('string type'),
    body('name')
        .notEmpty().withMessage('name required')
        .isString().withMessage('string type'),
    handleValidationErrors
]