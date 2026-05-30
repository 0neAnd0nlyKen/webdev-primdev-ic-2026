import express from 'express'
// import prisma from './configs/database.js' dihapus karena sudah diimport di masing-masing controller
import {
    register,
    login,
} from '../controllers/auth.controller.js'

import {
  registerValidation,
  loginValidation,
} from '../validations/auth.validation.js'

const router = express.Router()


router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)

export default router