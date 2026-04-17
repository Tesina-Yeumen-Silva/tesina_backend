import type{ Request, Response, NextFunction } from 'express';
import { param,validationResult } from 'express-validator';

export const handleValidationErrors = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    next();
}

export const validateNumericId = (paramName: string = 'id') => [
    param(paramName)
        .exists().withMessage(`The parameter '${paramName}' is required in the URL`)
        .isInt({ min: 1 }).withMessage(`The parameter '${paramName}' must be a valid positive integer.`),
    
    handleValidationErrors
];