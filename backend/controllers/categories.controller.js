// categories.controller.js

import prisma from '../configs/database.config.js'
import logger from '../configs/logger.config.js'
import { validationResult } from 'express-validator'

export const getAllCategories = async (req, res) => {
  try {
    logger.debug('getAllCategories: Started')
    const categories = await prisma.categories.findMany({
      include: {
        books: true,
      },
    })
    logger.info({ count: categories.length }, 'Retrieved categories from database')
    res.json(categories)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve categories')
    res.status(500).json({ error: error.message })
  }
}

export const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ categoryId: id }, 'getCategoryById: Started')

    const category = await prisma.categories.findUnique({
      where: {
        id: id,
      },
      include: {
        books: true,
      },
    })

    if (!category) {
      logger.warn({ categoryId: id }, 'Category not found')
      return res.status(404).json({ error: `Category with ID: ${id} not found` })
    }

    logger.info({ categoryId: id }, 'Category retrieved successfully')
    res.json(category)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve category')
    res.status(500).json({ error: error.message })
  }
}

export const isCategoryExist = async (id) => {
  // Mencari kategori dengan ID yang sesuai di database menggunakan Prisma Client
  const category = await prisma.categories.findUnique({
    where: {
      id: id,
    },
  })

  return !!category
}

export const getAllBooksByCategoryId = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ categoryId: id }, 'getAllBooksByCategoryId: Started')

    const category = await prisma.categories.findUnique({
      where: {
        id: id,
      },
      include: {
        books: true,
      },
    })

    if (!category) {
      logger.warn({ categoryId: id }, 'Category not found')
      return res.status(404).json({
        success: false,
        message: `Category with ID: ${id} not found`,
      })
    }

    logger.info({ categoryId: id, bookCount: category.books.length }, 'Category retrieved successfully')
    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve category books')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving category books',
      error: error.message,
    })
  }
}

export const createCategory = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    logger.warn({ errors: validationErrors.array() }, 'Validation failed')
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors.array(),
    })
  }

  try {
    const { name } = req.body

    if (!name) {
      logger.warn('Category name is required')
      return res.status(400).json({ error: 'Category name is required' })
    }

    const category = await prisma.categories.create({
      data: {
        name,
      },
      include: {
        books: true,
      },
    })

    logger.info({ categoryId: category.id }, 'Category created successfully')
    res.status(201).json({ message: 'Category created successfully', category })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create category')
    res.status(500).json({ error: error.message })
  }
}

export const updateCategory = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    logger.warn({ errors: validationErrors.array() }, 'Validation failed')
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors.array(),
    })
  }

  try {
    const id = parseInt(req.params.id)
    const { name } = req.body

    if (!name) {
      logger.warn({ categoryId: id }, 'Category name is required')
      return res.status(400).json({ error: 'Category name is required' })
    }

    const category = await prisma.categories.update({
      where: {
        id: id,
      },
      data: {
        name,
      },
      include: {
        books: true,
      },
    })

    logger.info({ categoryId: id }, 'Category updated successfully')
    res.json({ message: 'Category updated successfully', category })
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn({ categoryId: req.params.id }, 'Category not found')
      return res.status(404).json({ error: `Category with ID: ${req.params.id} not found` })
    }
    logger.error({ error: error.message }, 'Failed to update category')
    res.status(500).json({ error: error.message })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ categoryId: id }, 'deleteCategory: Started')

    await prisma.categories.delete({
      where: {
        id: id,
      },
    })

    logger.info({ categoryId: id }, 'Category deleted successfully')
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn({ categoryId: req.params.id }, 'Category not found')
      return res.status(404).json({ error: `Category with ID: ${req.params.id} not found` })
    }
    logger.error({ error: error.message }, 'Failed to delete category')
    res.status(500).json({ error: error.message })
  }
}

