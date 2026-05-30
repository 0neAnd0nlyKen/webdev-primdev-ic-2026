import { body } from 'express-validator'

export const bookValidation = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),
  body('author')
    .isString()
    .withMessage('Author must be a string')
    .notEmpty()
    .withMessage('Author is required'),
  body('year')
    .isNumeric({ min: 1880 })
    .withMessage('Year must be a positive integer')
    .notEmpty()
    .withMessage('Year is required')
    .toInt(),
  body('categoryId')
    .optional()
    .isNumeric()
    .withMessage('Category ID must be a number')
    .toInt(),
]

export const updateBookValidation = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),
  body('author')
    .optional()
    .isString()
    .withMessage('Author must be a string')
    .notEmpty()
    .withMessage('Author is required'),
  body('year')
    .optional()
    .isNumeric({ min: 1880 })
    .withMessage('Year must be a positive integer')
    .notEmpty()
    .withMessage('Year is required')
    .toInt(),
  body('categoryId')
    .optional()
    .isNumeric()
    .withMessage('Category ID must be a number')
    .toInt(),
]