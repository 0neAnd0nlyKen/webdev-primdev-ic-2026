// books.controller.js

import prisma from '../configs/database.config.js' // jangan lupa import prisma
import logger from '../configs/logger.config.js'
import { isCategoryExist } from './categories.controller.js'
import { validationResult } from 'express-validator'
import { getFileUrl, uploadFile, deleteFile } from './cloudinary.controller.js'

const getCoverFile = (req) => {
  if (req.file) {
    return req.file
  }

  if (!req.body?.file) {
    return null
  }

  const file = req.body.file

  if (typeof file === 'string') {
    const match = file.match(/^data:(.+);base64,(.+)$/)
    if (match) {
      return {
        mimetype: match[1],
        buffer: Buffer.from(match[2], 'base64'),
      }
    }

    return {
      mimetype: 'application/octet-stream',
      buffer: Buffer.from(file, 'base64'),
    }
  }

  if (file.buffer && file.mimetype) {
    return file
  }

  return null
}

export const getBooks = async (req, res) => {
  try {
    logger.debug('getBooks: Started')
    const books = await prisma.books.findMany()

    logger.info({ count: books.length }, 'Retrieved books from database')

    books.forEach((book) => {
      if (!book.cloudinaryId) {
        book.coverUrl = null
      } else {
        book.coverUrl = getFileUrl(book.cloudinaryId)
      }
    })

    logger.debug('Generated cover URLs for all books')

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: books,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve books')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving books',
      error: error.message,
    })
  }
}

export const getBookById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ bookId: id }, 'getBookById: Started')

    const book = await prisma.books.findUnique({
      where: {
        id: id,
      },
    })

    if (!book) {
      logger.warn({ bookId: id }, 'Book not found')
      return res.status(404).json({
        success: false,
        message: `Book with ID: ${id} not found`,
      })
    }

    if (book.cloudinaryId) {
      book.coverUrl = getFileUrl(book.cloudinaryId)
    } else {
      book.coverUrl = null
    }

    logger.info({ bookId: id }, 'Book retrieved successfully')

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve book')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving book',
      error: error.message,
    })
  }
}

export const createBook = async (req, res) => {
  try {
    logger.debug({ body: req.body }, 'createBook: Started')

    const validationErrors = validationResult(req)

    if (!validationErrors.isEmpty()) {
      logger.warn({ errors: validationErrors.array() }, 'Validation failed')
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors.array(),
      })
    }

    const { title, author, year, categoryId } = req.body

    logger.debug({ categoryId }, 'Checking if category exists')
    const categoryExists = await isCategoryExist(categoryId)

    if (!categoryExists) {
      logger.warn({ categoryId }, 'Category not found')
      return res.status(404).json({
        success: false,
        message: `Category with ID: ${categoryId} not found`,
      })
    }

    const cover = getCoverFile(req)
    let cloudinaryId = null

    if (cover) {
      logger.debug(
        { fileName: cover.filename ?? 'body-file' },
        'Uploading cover to Cloudinary',
      )
      const result = await uploadFile(cover)
      cloudinaryId = result.public_id
      logger.info({ cloudinaryId }, 'Cover uploaded successfully')
    }

    logger.debug(
      { title, author, year, categoryId },
      'Creating book in database',
    )
    const book = await prisma.books.create({
      data: {
        title,
        author,
        year,
        categoryId,
        cloudinaryId,
      },
    })

    logger.info({ bookId: book.id, title }, 'Book created successfully')
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create book')
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating book',
      error: error.message,
    })
  }
}

export const updateBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ bookId: id, body: req.body }, 'updateBook: Started')

    const validationErrors = validationResult(req)

    if (!validationErrors.isEmpty()) {
      logger.warn(
        { bookId: id, errors: validationErrors.array() },
        'Validation failed',
      )
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors.array(),
      })
    }

    const { title, author, year, categoryId } = req.body

    logger.debug({ bookId: id }, 'Finding book in database')
    const book = await prisma.books.findUnique({
      where: {
        id: id,
      },
    })

    if (!book) {
      logger.warn({ bookId: id }, 'Book not found')
      return res.status(404).json({
        success: false,
        message: `Book with ID: ${id} not found`,
      })
    }

    if (categoryId) {
      logger.debug({ categoryId }, 'Checking if category exists')
      const categoryExists = await isCategoryExist(categoryId)

      if (!categoryExists) {
        logger.warn({ bookId: id, categoryId }, 'Category not found')
        return res.status(404).json({
          success: false,
          message: `Category with ID: ${categoryId} not found`,
        })
      }
    }

    const cover = req.file
    let cloudinaryId = book.cloudinaryId

    if (cover) {
      if (book.cloudinaryId) {
        logger.debug(
          { bookId: id, oldCloudinaryId: book.cloudinaryId },
          'Deleting old cover',
        )
        await deleteFile(book.cloudinaryId)
      }

      logger.debug(
        { bookId: id, fileName: cover.filename },
        'Uploading new cover to Cloudinary',
      )
      const result = await uploadFile(cover)
      cloudinaryId = result.public_id
      logger.info({ bookId: id, cloudinaryId }, 'Cover uploaded successfully')
    }

    logger.debug(
      { bookId: id, updates: { title, author, year, categoryId } },
      'Updating book',
    )
    const updatedBook = await prisma.books.update({
      where: {
        id: id,
      },
      data: {
        title,
        author,
        year,
        categoryId,
        cloudinaryId,
      },
    })

    logger.info({ bookId: id, title }, 'Book updated successfully')
    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook,
    })
  } catch (error) {
    logger.error(
      { bookId: req.params.id, error: error.message },
      'Failed to update book',
    )
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating book',
      error: error.message,
    })
  }
}

export const deleteBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ bookId: id }, 'deleteBook: Started')

    logger.debug({ bookId: id }, 'Finding book in database')
    const book = await prisma.books.findUnique({
      where: {
        id: id,
      },
    })

    if (!book) {
      logger.warn({ bookId: id }, 'Book not found')
      return res.status(404).json({
        success: false,
        message: `Book with ID: ${id} not found`,
      })
    }

    if (book.cloudinaryId) {
      logger.debug(
        { bookId: id, cloudinaryId: book.cloudinaryId },
        'Deleting cover from Cloudinary',
      )
      await deleteFile(book.cloudinaryId)
    }

    logger.debug({ bookId: id }, 'Deleting book from database')
    await prisma.books.delete({
      where: {
        id: id,
      },
    })

    logger.info({ bookId: id }, 'Book deleted successfully')
    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    })
  } catch (error) {
    logger.error(
      { bookId: req.params.id, error: error.message },
      'Failed to delete book',
    )
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting book',
      error: error.message,
    })
  }
}