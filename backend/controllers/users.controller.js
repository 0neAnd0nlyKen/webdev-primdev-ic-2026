import prisma from "../configs/database.config.js";
import logger from '../configs/logger.config.js';

import { validationResult } from 'express-validator';

export const getUsers = async (req, res) => {
  try {
    logger.debug('getUsers: Started')
    const users = await prisma.users.findMany()
    logger.info({ count: users.length }, 'Retrieved users from database')
    res.json(users)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve users')
    res.status(500).json({ error: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ userId: id }, 'getUserById: Started')

    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    })

    if (!user) {
      logger.warn({ userId: id }, 'User not found')
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    logger.info({ userId: id }, 'User retrieved successfully')
    res.json(user)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve user')
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
    logger.warn({ errors: validationErrors.array() }, 'Validation failed')
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
    logger.debug({ email }, 'Hashed password for new user')

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
    })

    logger.info({ userId: user.id, email }, 'User created successfully')
    res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create user')
    res.status(500).json({ error: error.message })
  }
}

export const updateUser = async (req, res) => {
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
    const { name, email, password, role } = req.body
    logger.debug({ userId: id, body: req.body }, 'updateUser: Started')

    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    })

    if (!user) {
      logger.warn({ userId: id }, 'User not found')
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password }),
      ...(role && { role }),
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: id,
      },
      data: updateData,
    })

    logger.info({ userId: id }, 'User updated successfully')
    res.json({ message: `User with ID: ${id} updated successfully`, user: updatedUser })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to update user')
    res.status(500).json({ error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ userId: id }, 'deleteUser: Started')

    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    })

    if (!user) {
      logger.warn({ userId: id }, 'User not found')
      return res.status(404).json({ error: `User with ID: ${id} not found` })
    }

    await prisma.users.delete({
      where: {
        id: id,
      },
    })

    logger.info({ userId: id }, 'User deleted successfully')
    res.json({ message: `User with ID: ${id} deleted successfully` })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to delete user')
    res.status(500).json({ error: error.message })
  }
}

export const getUserByIdWithProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ userId: id }, 'getUserByIdWithProfile: Started')

    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      logger.warn({ userId: id }, 'User with profile not found')
      return res.status(404).json({
        success: false,
        message: `User with ID: ${id} not found`,
      })
    }

    logger.info({ userId: id }, 'User with profile retrieved successfully')
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve user with profile')
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving user with profile',
      error: error.message,
    })
  }
}