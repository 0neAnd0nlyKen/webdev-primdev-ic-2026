// profiles.controller.js

import prisma from '../configs/database.config.js'
import logger from '../configs/logger.config.js'
import { isUserExist } from './users.controller.js'

export const getAllProfiles = async (req, res) => {
  try {
    logger.debug('getAllProfiles: Started')
    const profiles = await prisma.profiles.findMany({
      include: {
        user: true,
      },
    })
    logger.info({ count: profiles.length }, 'Retrieved profiles from database')
    res.json(profiles)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve profiles')
    res.status(500).json({ error: error.message })
  }
}

export const getProfileById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ profileId: id }, 'getProfileById: Started')

    const profile = await prisma.profiles.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
      },
    })

    if (!profile) {
      logger.warn({ profileId: id }, 'Profile not found')
      return res.status(404).json({ error: `Profile with ID: ${id} not found` })
    }

    logger.info({ profileId: id }, 'Profile retrieved successfully')
    res.json(profile)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to retrieve profile')
    res.status(500).json({ error: error.message })
  }
}

export const createProfile = async (req, res) => {
  try {
    logger.debug({ body: req.body }, 'createProfile: Started')
    const { userId, address, phone } = req.body

    const userExists = await isUserExist(userId)

    if (!userExists) {
      logger.warn({ userId }, 'User not found while creating profile')
      return res.status(404).json({
        success: false,
        message: `User with ID: ${userId} not found`,
      })
    }

    const profile = await prisma.profiles.create({
      data: {
        userId,
        address,
        phone,
      },
      include: {
        user: true,
      },
    })

    logger.info({ profileId: profile.id, userId }, 'Profile created successfully')
    res.status(201).json({ message: 'Profile created successfully', profile })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create profile')
    res.status(500).json({ error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { address, phone } = req.body
    logger.debug({ profileId: id, body: req.body }, 'updateProfile: Started')

    const existingProfile = await prisma.profiles.findUnique({
      where: { id },
    })

    if (!existingProfile) {
      logger.warn({ profileId: id }, 'Profile not found')
      return res.status(404).json({ error: `Profile with ID: ${id} not found` })
    }

    const profile = await prisma.profiles.update({
      where: {
        id: id,
      },
      data: {
        address,
        phone,
      },
      include: {
        user: true,
      },
    })

    logger.info({ profileId: id }, 'Profile updated successfully')
    res.json({ message: 'Profile updated successfully', profile })
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn({ profileId: req.params.id }, 'Profile not found')
      return res.status(404).json({ error: `Profile with ID: ${req.params.id} not found` })
    }
    logger.error({ error: error.message }, 'Failed to update profile')
    res.status(500).json({ error: error.message })
  }
}

export const deleteProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    logger.debug({ profileId: id }, 'deleteProfile: Started')

    await prisma.profiles.delete({
      where: {
        id: id,
      },
    })

    logger.info({ profileId: id }, 'Profile deleted successfully')
    res.json({ message: 'Profile deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn({ profileId: req.params.id }, 'Profile not found')
      return res.status(404).json({ error: `Profile with ID: ${req.params.id} not found` })
    }
    logger.error({ error: error.message }, 'Failed to delete profile')
    res.status(500).json({ error: error.message })
  }
}