import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express()
dotenv.config()
app.use(cors())

const PORT = process.env.PORT || 4000
const MONGOURL = process.env.MONGO_URL

mongoose.connect(MONGOURL).then(() => {
  console.log('db connected')
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
  })
}).catch((error) => console.log(error))

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
})

const UserModel = mongoose.model("users", userSchema)

app.use(express.json());


//REGISTER
app.post('/register', async (req, res) => {
  console.log('data:', req.body)
  const { username, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({ username, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: 'User registered succesfully'})
  } catch (error) {
    console.error('Error registering user:', error)
  }
})

