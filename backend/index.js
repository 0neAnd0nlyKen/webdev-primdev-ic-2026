import express from 'express'
// import prisma from './configs/database.js' dihapus karena sudah diimport di masing-masing route
import router from './routes/index.routes.js'
import logger from './configs/logger.config.js' // jangan lupa import

const app = express()
const port = 3000

// Middleware untuk parsing JSON dan form data pada request body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

if (process.env.ENV !== 'production') {
  const port = process.env.PORT || 3000

  app.listen(port, () => {
    logger.info(`Library API is running at http://localhost:${port}`)
    logger.info('Application started successfully')
  })
}

export default app

// npx plugins add vercel/vercel-plugin