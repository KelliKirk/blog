const express = require('express')
const { randomBytes } = require('node:crypto') 
const cors = require('cors')
const axios = require ('axios')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const allowedOrigins = [
  "https://blog.local",
  "http://blog.local",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions))

const JWT_SECRET = 'your-secret-key'

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

const posts = []

app.get('/posts', verifyToken, (req, res) => {
    res.json(posts)
} )

app.post('/posts/create', verifyToken, async (req, res) => {
    const id = randomBytes(4).toString('hex')
    const title = req.body.title
    const post = {
        id: id,
        title
    } 
    posts.push(post)

    axios.post('http://event-bus-srv:5005/events', {
        type: 'PostCreated',
        data: post
    }).catch((err) => {
        console.log('Error sending event to the event bus', err.message, err.code)
    } )

    res.status(201).json({
        post: post
    } )
}  )

app.post('/events', (req, res) => {
    console.log('Received event', req.body)
    res.json({ })
} )

app.listen(5000, () => {
    console.log('posts service')
    console.log('Posts service is running on http://localhost:5000')
} )


