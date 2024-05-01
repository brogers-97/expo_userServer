import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
  username: {
    type: String,
    unique: true,
  },
  password: String,
})

const UserModel = mongoose.model("users", userSchema)

app.use(express.json());


//REGISTER
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  try { 
    const exisitngUser = await UserModel.findOne({ username })
    
    if(exisitngUser) {
      return res.status(401).json({ message: 'User already exists'})
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({ username, password: hashedPassword })
    await newUser.save()

    const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1d'})
    
    res.status(201).json({ message: 'User registered succesfully', token})
  }
  catch (error) {
    console.error('Error registering user:', error)
  }
})

app.get('/login', async (req, res) => {
  const { username, password } = req.query; // Extracting from query parameters

  try {
    const existingUser = await UserModel.findOne({ username });

    if (!existingUser) {
      return res.status(401).json({ message: 'this is the one' });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const token = jwt.sign({ username: existingUser.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
