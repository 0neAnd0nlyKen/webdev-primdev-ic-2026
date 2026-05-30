import { body } from 'express-validator'

export const borrowingValidation = [
  body('bookId')
    .isInt()
    .withMessage('Book ID must be an integer')
    .notEmpty()
    .withMessage('Book ID is required'),
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .notEmpty()
    .withMessage('User ID is required'),
]

export const updateBookValidation = [
  body('bookId')
    .isInt()
    .withMessage('Book ID must be an integer')
    .notEmpty()
    .withMessage('Book ID is required'),
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .notEmpty()
    .withMessage('User ID is required'),
]