import express from 'express'
// import prisma from './configs/database.js' dihapus karena sudah diimport di masing-masing route
import router from './routes/index.routes.js'

const app = express()
const port = 3000

// Middleware untuk parsing JSON pada request body
app.use(express.json())
app.use(router)

if (process.env.ENV !== 'production') {
  const port = process.env.PORT || 3000

  app.listen(port, () => {
    logger.info(`Library API is running at http://localhost:${port}`)
    logger.info('Application started successfully')
  })
}

export default app