const express = require('express')
const cors = require('cors')

const app = express()
app.use (express.json())
app.use(cors({origin:'http://localhost:3000'}))

const posts = {}

app.get('/posts', (req, res) => {
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