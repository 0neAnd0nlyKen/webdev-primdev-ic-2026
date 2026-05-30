// categories.controller.js

import prisma from '../configs/database.config.js'

import { validationResult } from 'express-validator';

export const getAllBorrowings = async (req, res) => {
  // Mengambil semua peminjaman dari database menggunakan Prisma Client
  const borrowings = await prisma.borrowings.findMany({
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  })

  res.json({
    success: true,
    message: 'Borrowings retrieved successfully',
    data: borrowings,
  })
}

export const getBorrowingById = async (req, res) => {
  // Mendapatkan ID peminjaman yang akan diupdate dari parameter URL
  // Lalu mengubahnya menjadi tipe data integer menggunakan parseInt
  const id = parseInt(req.params.id)

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  })

  // Jika peminjaman tidak ditemukan, kirimkan pesan error
  if (!borrowing) {
    return res.json({
      success: false,
      message: `Borrowing with ID: ${id} not found`,
    })
  }

  res.json({
    success: true,
    message: 'Borrowing retrieved successfully',
    data: borrowing,
  })
}

export const createBorrowing = async (req, res) => {

  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors.array(),
    })
  }

  // Mendapatkan data userId dan bookId dari body request
  const { userId, bookId } = req.body

  // Mengecek apakah user dengan ID yang diberikan ada di database menggunakan fungsi isUserExist
  const userExists = await isUserExist(userId)

  if (!userExists) {
    return res.json({
      success: false,
      message: `User with ID: ${userId} not found`,
    })
  }

  // Mengecek apakah buku dengan ID yang diberikan ada di database menggunakan fungsi isBookExist
  const bookExists = await isBookExist(bookId)

  if (!bookExists) {
    return res.json({
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

  // Update ketersediaan buku menjadi false setelah dipinjam
  await prisma.books.update({
    where: { id: parseInt(bookId) },
    data: { available: false },
  })

  res.json({
    success: true,
    message: 'Borrowing created successfully',
    data: borrowing,
  })
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
  // Mendapatkan ID peminjaman yang akan dikembalikan dari parameter URL
  const { id } = req.params

  // Mencari peminjaman dengan ID yang sesuai di database menggunakan Prisma Client
  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
  })

  // Jika peminjaman tidak ditemukan, kirimkan pesan error
  if (!borrowing) {
    return res.json({
      success: false,
      message: 'Borrowing not found',
    })
  }

  // Cek apakah buku sudah dikembalikan
  if (borrowing.returned_at) {
    return res.json({
      success: false,
      message: 'Book already returned',
    })
  }

  // Update peminjaman dengan ID yang sesuai di database menggunakan Prisma Client
  const returnedBorrowing = await prisma.borrowings.update({
    where: { id: parseInt(id) },
    data: { returned_at: new Date() },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  })

  // Update ketersediaan buku menjadi true setelah dikembalikan
  await prisma.books.update({
    where: { id: returnedBorrowing.bookId },
    data: { available: true },
  })

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: returnedBorrowing,
  })
}

export const deleteBorrowing = async (req, res) => {
  // Mendapatkan ID peminjaman yang akan dihapus dari parameter URL
  const id = parseInt(req.params.id)

  // Mencari peminjaman dengan ID yang sesuai di database menggunakan Prisma Client
  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  })

  // Jika peminjaman tidak ditemukan, kirimkan pesan error
  if (!borrowing) {
    return res.json({
      success: false,
      message: 'Borrowing not found',
    })
  }

  // Hapus peminjaman dengan ID yang sesuai di database menggunakan Prisma Client
  await prisma.borrowings.delete({ where: { id: parseInt(id) } })

  // Update ketersediaan buku menjadi true jika buku belum dikembalikan
  if (!borrowing.returned_at) {
    await prisma.books.update({
      where: { id: borrowing.bookId },
      data: { available: true },
    })
  }

  res.json({
    success: true,
    message: 'Borrowing deleted successfully',
    data: borrowing,
  })
}