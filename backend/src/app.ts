import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import pdfRoutes from './routes/pdf.routes.js'
import { errorMiddleware } from './middleware/error.middleware.js'

const app = express()

app.use(
  cors({
    origin: env.frontendUrl,
  }),
)

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'PDF Editor API is running',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PDF Editor backend is running',
  })
})

app.use('/api/pdf', pdfRoutes)

app.use(errorMiddleware)


export default app