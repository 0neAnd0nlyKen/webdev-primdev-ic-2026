import { body } from 'express-validator'

export const userValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Email is not valid')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .notEmpty()
    .withMessage('Password is required'),
  body('role')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER')
    .notEmpty()
    .withMessage('Role is required'),
]

export const updateUserValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Email is not valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER'),
]