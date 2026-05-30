import express from 'express'
import prisma from '../configs/database.config.js'

import {
getUsers,
getUserById,
getUserByIdWithProfile,
createUser,
updateUser,
deleteUser
} from '../controllers/users.controller.js'

import {
  userValidation,
  updateUserValidation,
} from '../validations/users.validation.js'


const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUserById)
router.get('/:id/profile', getUserByIdWithProfile) // buat route-nya
router.post('/', userValidation, createUser)
router.put('/:id', updateUserValidation, updateUser)
router.delete('/:id', deleteUser)

export default router
