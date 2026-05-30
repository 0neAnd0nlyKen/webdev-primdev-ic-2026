// categories.route.js

import express from 'express'
import {
    getAllCategories,
    getCategoryById,
    getAllBooksByCategoryId,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categories.controller.js'

import {
    categoryValidation,
    updateCategoryValidation,
} from '../validations/categories.validation.js'

import {
  authorizeAdmin,
} from '../middlewares/admin.middleware.js'

const router = express.Router()

router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.get('/:id/books', getAllBooksByCategoryId) // buat route baru
router.post('/', authorizeAdmin, categoryValidation, createCategory)
router.put('/:id', authorizeAdmin, updateCategoryValidation, updateCategory)
router.delete('/:id', authorizeAdmin, deleteCategory)

export default router