const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

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

// Dummy user credentials
const DUMMY_USER = {
  email: 'admin@blog.local',
  password: 'qwerty'
}

const JWT_SECRET = 'your-secret-key' // In production, use environment variable

// Sign in route
app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body

  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    const token = jwt.sign(
      { email: DUMMY_USER.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      token,
      user: { email: DUMMY_USER.email }
    })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

// Refresh token route
app.post('/auth/refresh', (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const newToken = jwt.sign(
      { email: decoded.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token: newToken })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout route (client-side token removal)
app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// Verify token route
app.post('/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    res.json({ valid: true })
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' })
  }
})

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Protected route example
app.get('/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user })
})

app.listen(5006, () => {
  console.log('Auth service running on http://localhost:5006')
})