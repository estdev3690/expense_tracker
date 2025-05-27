import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import mongoDB from './config/mongoDB.js'
import userRouter from './routes/userRouter.js'

dotenv.config()
mongoDB()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use('/api/user', userRouter)

// Serve frontend (React) static files
const __dirname = path.resolve()
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})
