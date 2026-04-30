const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
app.use (express.json())

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

const posts = {}

app.get('/posts', verifyToken, (req, res) => {
    res.send(posts)
} )

app.post('/events', (req, res) => {
    if (req.body.type === 'PostCreated'){
        const { id, title } = req.body.data
        posts[id] = { id, title, comments: []  }  
    } 

    if(req.body.type === 'CommentCreated'){
        const { id, content, postId } = req.body.data
        const post = posts[postId]
        post.comments.push({ id, content, status: 'pending' } ) 
    } 

    if (req.body.type === 'CommentStatusUpdated') {
    const { id, postId, content, status } = req.body.data
    const post = posts[postId]
    if (!post) return res.json({})
    const comment = post.comments.find(c => c.id === id)
    if (comment) {
        comment.status = status
    }
}
    
    console.log(posts)

    res.json({ })
} )



app.listen(5002, () => {
    console.log('query service')
    console.log('Server is running on http://localhost:5002')
} )