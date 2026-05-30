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

export const getRecommendations = async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const limit = 3 // force top-3 recommendations
    logger.debug({ userId, limit }, 'getRecommendations: Started (forced top-3)')

    const startTs = Date.now()
    const [borrowings, books] = await Promise.all([
      prisma.borrowings.findMany({ select: { userId: true, bookId: true } }),
      prisma.books.findMany({ select: { id: true, title: true, author: true, categoryId: true, cloudinaryId: true } }),
    ])

    logger.debug({ borrowingsCount: borrowings.length, booksCount: books.length }, 'Fetched borrowings and books')

    const bookMap = new Map()
    const bookCategory = new Map()
    books.forEach((b) => {
      bookMap.set(b.id, b)
      bookCategory.set(b.id, b.categoryId)
    })

    logger.debug({ booksLoaded: bookMap.size }, 'Built book maps')

    const userToBooks = new Map()
    for (const row of borrowings) {
      const uid = row.userId
      const bid = row.bookId
      if (!userToBooks.has(uid)) userToBooks.set(uid, new Set())
      userToBooks.get(uid).add(bid)
    }

    logger.debug({ totalUsersSeen: userToBooks.size }, 'Mapped users to their borrowed books')

    const targetSet = userToBooks.get(userId) || new Set()
    logger.debug({ userBorrowCount: targetSet.size }, 'Target user borrow set')

    if (targetSet.size === 0) {
      logger.info({ userId }, 'No history for user, returning popular books fallback')
      const popMap = new Map()
      for (const { bookId } of borrowings) popMap.set(bookId, (popMap.get(bookId) || 0) + 1)
      const popular = Array.from(popMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([bookId]) => bookMap.get(bookId))
        .filter(Boolean)
        .slice(0, limit)
      logger.info({ userId, fallbackCount: popular.length, popularIds: popular.map(b => b.id) }, 'Popular fallback returned')
      return res.json({ success: true, data: popular })
    }

    const collabScores = new Map()
    const similarUsers = []
    for (const [otherUser, otherSet] of userToBooks.entries()) {
      if (otherUser === userId) continue
      const intersectionSize = [...otherSet].filter((b) => targetSet.has(b)).length
      if (intersectionSize === 0) continue
      const unionSize = new Set([...otherSet, ...targetSet]).size
      const jaccard = intersectionSize / unionSize
      similarUsers.push({ userId: otherUser, jaccard, intersectionSize })
      for (const b of otherSet) {
        if (targetSet.has(b)) continue
        collabScores.set(b, (collabScores.get(b) || 0) + jaccard)
      }
    }

    similarUsers.sort((a, b) => b.jaccard - a.jaccard)
    logger.debug({ similarUserCount: similarUsers.length, topSimilar: similarUsers.slice(0, 5) }, 'Similar users computed')
    logger.debug({ collabCandidates: collabScores.size }, 'Collaborative candidates')

    // Log top collaborative candidate scores
    const topCollab = Array.from(collabScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, score]) => ({ bookId, score }))
    logger.debug({ topCollab }, 'Top collaborative candidate scores')

    const userCategoryCounts = new Map()
    for (const b of targetSet) {
      const cat = bookCategory.get(b)
      if (cat == null) continue
      userCategoryCounts.set(cat, (userCategoryCounts.get(cat) || 0) + 1)
    }

    // Log category vector for user
    const categoryObj = Object.fromEntries(Array.from(userCategoryCounts.entries()))
    logger.debug({ categoryObj }, 'User category counts')

    const maxCatCount = Math.max(0, ...Array.from(userCategoryCounts.values()))
    logger.debug({ categoryDims: userCategoryCounts.size, maxCatCount }, 'Content vector built')

    const contentScores = new Map()
    for (const b of books) {
      if (targetSet.has(b.id)) continue
      const cat = b.categoryId
      const cnt = userCategoryCounts.get(cat) || 0
      const score = maxCatCount > 0 ? cnt / maxCatCount : 0
      if (score > 0) contentScores.set(b.id, score)
    }

    logger.debug({ contentCandidates: contentScores.size }, 'Content candidates')
    const topContent = Array.from(contentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, score]) => ({ bookId, score }))
    logger.debug({ topContent }, 'Top content candidate scores')

    const combined = new Map()
    const alpha = 0.5
    const beta = 0.5
    const collabMax = Math.max(0, ...Array.from(collabScores.values()))
    for (const [bookId, s] of collabScores.entries()) {
      const norm = collabMax > 0 ? s / collabMax : 0
      combined.set(bookId, { collab: norm, content: contentScores.get(bookId) || 0 })
    }
    for (const [bookId, s] of contentScores.entries()) {
      if (!combined.has(bookId)) combined.set(bookId, { collab: 0, content: s })
      else combined.get(bookId).content = s
    }

    logger.debug({ collabMax, combinedSize: combined.size }, 'Combined candidate map built')

    const results = []
    for (const [bookId, comps] of combined.entries()) {
      const collabComp = comps.collab
      const contentComp = comps.content
      const finalScore = alpha * collabComp + beta * contentComp
      const book = bookMap.get(bookId)
      if (!book) continue
      const reasons = []
      if (collabComp > 0) reasons.push('Users similar to you borrowed this')
      if (contentComp > 0) reasons.push(`Because you borrowed ${userCategoryCounts.get(book.categoryId) || 0} books in this category`)
      results.push({
        bookId: book.id,
        title: book.title,
        author: book.author,
        categoryId: book.categoryId,
        cloudinaryId: book.cloudinaryId,
        score: finalScore,
        components: { collab: collabComp, content: contentComp },
        reason: reasons.join('; ') || 'Recommended',
      })
    }

    logger.debug({ resultCandidates: results.length }, 'Built result candidates before sorting')

    results.sort((a, b) => b.score - a.score)
    const top = results.slice(0, limit)

    const tookMs = Date.now() - startTs
    logger.info({ userId, returned: top.length, topIds: top.map(t => t.bookId), tookMs }, 'Recommendations generated')
    res.json({ success: true, data: top })
  } catch (error) {
    logger.error({ error: error.message, params: req.params }, 'Failed to generate recommendations')
    res.status(500).json({ success: false, message: 'Failed to generate recommendations', error: error.message })
  }
}