// borrowings.controller.js

import prisma from '../configs/database.config.js'
import logger from '../configs/logger.config.js'
import { validationResult } from 'express-validator'

export const getAllBorrowings = async (req, res) => {
  try {
    logger.debug('getAllBorrowings: Started')
    const borrowings = await prisma.borrowings.findMany({
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    })

    logger.info({ count: borrowings.length }, 'Retrieved borrowings from database')
    res.json({
      success: true,
      message: 'Borrowings retrieved successfully',
      data: borrowings,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve borrowings')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving borrowings',
      error: error.message,
    })
  }
}

export const getBorrowingById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ borrowingId: id }, 'getBorrowingById: Started')

    const borrowing = await prisma.borrowings.findUnique({
      where: { id: parseInt(id) },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    })

    if (!borrowing) {
      logger.warn({ borrowingId: id }, 'Borrowing not found')
      return res.status(404).json({
        success: false,
        message: `Borrowing with ID: ${id} not found`,
      })
    }

    logger.info({ borrowingId: id }, 'Borrowing retrieved successfully')
    res.json({
      success: true,
      message: 'Borrowing retrieved successfully',
      data: borrowing,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve borrowing')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving borrowing',
      error: error.message,
    })
  }
}

export const createBorrowing = async (req, res) => {
  try {
    logger.debug({ body: req.body }, 'createBorrowing: Started')

    const validationErrors = validationResult(req)

    if (!validationErrors.isEmpty()) {
      logger.warn({ errors: validationErrors.array() }, 'Validation failed')
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors.array(),
      })
    }

    const { userId, bookId } = req.body

    logger.debug({ userId }, 'Checking if user exists')
    const userExists = await isUserExist(userId)

    if (!userExists) {
      logger.warn({ userId }, 'User not found')
      return res.status(404).json({
        success: false,
        message: `User with ID: ${userId} not found`,
      })
    }

    logger.debug({ bookId }, 'Checking if book exists')
    const bookExists = await isBookExist(bookId)

    if (!bookExists) {
      logger.warn({ bookId }, 'Book not found')
      return res.status(404).json({
        success: false,
        message: `Book with ID: ${bookId} not found`,
      })
    }

    const borrowing = await prisma.borrowings.create({
      data: {
        userId: parseInt(userId),
        bookId: parseInt(bookId),
      },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    })

    logger.debug({ bookId }, 'Updating book availability to false')
    await prisma.books.update({
      where: { id: parseInt(bookId) },
      data: { available: false },
    })

    logger.info({ borrowingId: borrowing.id, userId, bookId }, 'Borrowing created successfully')
    res.json({
      success: true,
      message: 'Borrowing created successfully',
      data: borrowing,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create borrowing')
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating borrowing',
      error: error.message,
    })
  }
}

export const isUserExist = async (id) => {
  // Mencari pengguna dengan ID yang sesuai di database menggunakan Prisma Client
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },
  })

  return !!user
}

export const isBookExist = async (id) => {
  // Mencari buku dengan ID yang sesuai di database menggunakan Prisma Client
  const book = await prisma.books.findUnique({
    where: {
      id: id,
    },
  })

  return !!book
}

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params
    logger.debug({ borrowingId: id }, 'returnBook: Started')

    const borrowing = await prisma.borrowings.findUnique({
      where: { id: parseInt(id) },
    })

    if (!borrowing) {
      logger.warn({ borrowingId: id }, 'Borrowing not found')
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found',
      })
    }

    if (borrowing.returned_at) {
      logger.warn({ borrowingId: id }, 'Book already returned')
      return res.json({
        success: false,
        message: 'Book already returned',
      })
    }

    const returnedBorrowing = await prisma.borrowings.update({
      where: { id: parseInt(id) },
      data: { returned_at: new Date() },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    })

    await prisma.books.update({
      where: { id: returnedBorrowing.bookId },
      data: { available: true },
    })

    logger.info({ borrowingId: id }, 'Book returned successfully')
    res.json({
      success: true,
      message: 'Book returned successfully',
      data: returnedBorrowing,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to return book')
    res.status(500).json({
      success: false,
      message: 'An error occurred while returning book',
      error: error.message,
    })
  }
}

export const deleteBorrowing = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ borrowingId: id }, 'deleteBorrowing: Started')

    const borrowing = await prisma.borrowings.findUnique({
      where: { id: parseInt(id) },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    })

    if (!borrowing) {
      logger.warn({ borrowingId: id }, 'Borrowing not found')
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found',
      })
    }

    await prisma.borrowings.delete({ where: { id: parseInt(id) } })

    if (!borrowing.returned_at) {
      await prisma.books.update({
        where: { id: borrowing.bookId },
        data: { available: true },
      })
    }

    logger.info({ borrowingId: id }, 'Borrowing deleted successfully')
    res.json({
      success: true,
      message: 'Borrowing deleted successfully',
      data: borrowing,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to delete borrowing')
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting borrowing',
      error: error.message,
    })
  }
}