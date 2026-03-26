const express = require('express')
const { randomBytes } = require('node:crypto') 
const axios = require ('axios')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({origin:'http://localhost:3000'}))

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
        content,
        status: 'pending'
    } 
    postComments.push(comment)

    axios.post('http://localhost:5005/events', {
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
            await axios.post('http://localhost:5005/events', {
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

