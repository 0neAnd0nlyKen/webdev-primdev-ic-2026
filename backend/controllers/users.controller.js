import prisma from "../configs/database.config.js";

import { validationResult } from 'express-validator';

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const user = await prisma.users.findUnique({
      where: {
        id: id
      }
    })

    if (!user) {
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const isUserExist = async (id) => {
  // Mencari kategori dengan ID yang sesuai di database menggunakan Prisma Client
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },
  })

  return !!user
}


export const createUser = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors.array(),
    })
  }

  try {
    const { name, email, password, role } = req.body

    const bcrypt = await import('bcrypt')
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Hashed Password:', hashedPassword)
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER'
      }
    })

    res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUser = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validationErrors.array(),
    })
  }

  try {
    const id = parseInt(req.params.id)
    const { name, email, password, role } = req.body

    const user = await prisma.users.findUnique({
      where: {
        id: id
      }
    })

    if (!user) {
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: id
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password }),
        ...(role && { role })
      }
    })

    res.json({ message: `User with ID: ${id} updated successfully`, user: updatedUser })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const user = await prisma.users.findUnique({
      where: {
        id: id
      }
    })

    if (!user) {
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    await prisma.users.delete({
      where: {
        id: id
      }
    })

    res.json({ message: `User with ID: ${id} deleted successfully` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserByIdWithProfile = async (req, res) => {
  // Mendapatkan ID pengguna yang akan diupdate dari parameter URL
  // Lalu mengubahnya menjadi tipe data integer menggunakan parseInt
  const id = parseInt(req.params.id)

  // Mengambil pengguna dengan ID yang sesuai dari database menggunakan Prisma Client
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },

    include: {
      profile: true,
    }
  })

  // Jika pengguna tidak ditemukan, kirimkan pesan error
  if (!user) {
    res.json({
      success: false,
      message: `User with ID: ${id} not found`,
    })
    return
  }

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  })
}