const express = require('express')
const { randomBytes } = require('node:crypto') 
const axios = require ('axios')
const cors = require('cors')
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

const postComments = []

app.get('/posts/:id/comments', verifyToken, (req, res) => {
    res.json(postComments.filter(comment => comment.postId === req.params.id))
} )

app.post('/posts/:id/comments', verifyToken, (req, res) => {
    const postId = req.params.id
    const content = req.body.content
    const comment = {
        id: randomBytes(4).toString('hex'),
        postId,
        content,
        status: 'pending'
    } 
    postComments.push(comment)

    axios.post('http://event-bus-srv:5005/events', {
       type: 'CommentCreated',
       data: comment
    }).catch(err => {
        console.log('Error sending event to event bus:', err.message)
    })

    res.status(201).json(comment)
} )

app.post('/events', async (req, res) => {
    const { type, data } = req.body
    console.log('Received event:', req.body)  

    if (type === 'CommentModerated') {
        const comment = postComments.find(c => c.id === data.id)
        if (comment) {
            comment.status = data.status
            await axios.post('http://event-bus-srv:5005/events', {
                type: 'CommentStatusUpdated',
                data: { ...comment }
            }).catch(err => console.log('Error:', err.message))
        }
    }

    res.json({})
})


app.listen(5001, () => {
    console.log('Comments service running on http://localhost:5001')
})

