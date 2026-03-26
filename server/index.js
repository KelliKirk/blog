const express = require('express')
const { randomBytes } = require('node:crypto') 
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({origin:'http://localhost:3000'}))

const posts = []

app.get('/posts', (req, res) => {
    res.json(posts)
} )

app.post('/posts', (req, res) => {
    const title = req.body.title
    const post = {
        id: randomBytes(4).toString('hex'),
        title
    } 
    posts.push(post)
    res.status(201).json({
        post: post
    } )
}  )

const postComments = []

app.get('/posts/:id/comments', (req, res) => {
    res.json(postComments.filter(comment => comment.postId === req.params.id))
} )

app.post('/posts/:id/comments', (req, res) => {
    const postId = req.params.id
    const content = req.body.content
    const comment = {
        id: randomBytes(4).toString('hex'),
        postId,
        content
    } 
    postComments.push(comment)
    res.status(201).json(comment)
} )

app.listen(5000, () => {
    console.log('Posts service is running on http://localhost:5000')
} )

app.listen(5001, () => {
    console.log('Comments service running on http://localhost:5001')
})