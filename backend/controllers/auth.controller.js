import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import prisma from '../configs/database.config.js'

export const register = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: validationErrors.array(),
    })
  }

  // Mendapatkan data pengguna baru dari request body
  const { name, email, password } = req.body

  // Mengecek apakah email sudah digunakan oleh pengguna lain di database menggunakan Prisma Client
  const count = await prisma.users.count({ where: { email } })

  if (count > 0) {
    return res.status(409).json({
      success: false,
      error: 'Email already in use',
    })
  }

  // Meng-hash password menggunakan bcryptjs dengan jumlah salt rounds yang diambil dari environment variable
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS),
  )

  // Menambahkan pengguna baru ke database menggunakan Prisma Client
  const user = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  res.status(201).json({
    message: 'Registration successful',
    user,
  })
}

export const login = async (req, res) => {
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: validationErrors.array(),
    })
  }

  // Mendapatkan data login dari request body
  const { email, password } = req.body

  // Mencari pengguna dengan email yang sesuai di database menggunakan Prisma Client
  const user = await prisma.users.findUnique({
    where: { email },
  })

  // Jika pengguna tidak ditemukan atau password tidak cocok, kirimkan pesan error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Membuat token JWT dengan payload yang berisi ID, email, dan role pengguna, serta menggunakan secret key dari environment variable dan mengatur masa berlaku token selama 1 jam
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  )

  // Menghapus properti password dari objek pengguna sebelum mengirimkannya dalam response
  delete user.password

  res.status(200).json({
    message:
      'Login successful. Copy the token below for authenticated requests. Expires in 1 hour.',
    user,
    token,
  })
}