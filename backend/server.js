import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoDB from './config/mongoDB.js'
import userRouter from './routes/userRouter.js'


dotenv.config()
mongoDB()

const app=express()
const PORT=process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use('/api/user',userRouter)


app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`)
})