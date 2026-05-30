// categories.route.js

import express from 'express'
import {
    getAllBorrowings,
    getBorrowingById,
    createBorrowing,
    isUserExist,
    isBookExist,
    returnBook,
    deleteBorrowing,
} from '../controllers/borrowings.controller.js'

import {
  borrowingValidation,
} from '../validations/borrowings.validation.js'

const router = express.Router()

router.get('/', getAllBorrowings)
router.get('/:id', getBorrowingById)
router.post('/', borrowingValidation, createBorrowing)
router.put('/:id/return', returnBook)
router.delete('/:id', deleteBorrowing)

export default router