import { body } from 'express-validator';
import { handleValidationErrors } from './validationHelper.js';

export const validateRole = [
    body('name')
        .notEmpty().withMessage('name required')
        .isString().withMessage('string type'),
    handleValidationErrors
]

