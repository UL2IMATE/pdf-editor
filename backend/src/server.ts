import app from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.log(`PDF Editor backend running on http://localhost:${env.port}`)
  console.log(`Environment: ${env.nodeEnv}`)
})
