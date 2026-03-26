const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

app.post('/events', async (req, res) => {
    const { type, data } = req.body

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved'
        await axios.post('http://localhost:5005/events', {
            type: 'CommentModerated',
            data: { ...data, status }
        }).catch(err => console.log('Error:', err.message))
    }

    res.json({})
})

app.listen(5003, () => {
    console.log('Moderation service running on http://localhost:5003')
})