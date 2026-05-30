export const authorizeAdmin = (req, res, next) => {
  // Memeriksa apakah user adalah admin
  // dengan memeriksa properti role pada objek user yang sudah di-decode dari token JWT
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' })
  }

  next()
}