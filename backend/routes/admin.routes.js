import express from 'express'
import { adminPanel, adminProxy } from '../controllers/admin.controller.js'

const router = express.Router()

router.get('/', adminPanel)
router.post('/proxy', adminProxy)

export default router
