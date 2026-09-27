import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 20),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}
