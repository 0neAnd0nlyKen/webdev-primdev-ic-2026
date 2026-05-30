import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  // Mendapatkan token dari header Authorization
  const authHeader = req.headers['authorization']

  // Memisahkan token dari header Authorization yang biasanya berbentuk 
  // "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1]

  // Jika token tidak ditemukan, kirimkan pesan error
  if (!token) {
    return res.status(403).json({
      error: 'Access token is missing',
    })
  }

  // Memverifikasi token JWT menggunakan secret key dari environment variable
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid access token',
      })
    }
    req.user = user
    next()
  })
}
