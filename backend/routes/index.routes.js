import express from 'express'
import booksRoute from './books.routes.js'
import usersRoute from './users.routes.js'
import profilesRoute from './profiles.routes.js'
import categoriesRoute from './categories.routes.js'
import borrowingsRoute from './borrowings.routes.js'
import authRoute from './auth.routes.js'
import adminRoute from './admin.routes.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'

import {
  authorizeAdmin,
} from '../middlewares/admin.middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.send('Welcome to the API Library')
})

router.use('/admin', adminRoute)
router.use('/auth', authRoute)
router.use('/books', authenticateToken, booksRoute)
// router.use('/users', usersRoute)
// router.use('/users', authorizeAdmin, authenticateToken, usersRoute)
router.use('/users', usersRoute)
router.use('/profiles', authorizeAdmin, authenticateToken, profilesRoute)
router.use('/categories', authenticateToken, categoriesRoute)
router.use('/borrowings', authorizeAdmin, authenticateToken, borrowingsRoute)


export default router
