import React, { useEffect, useState } from 'react'
import axios from 'axios'

const CommentsList = ({postid}) => {
    const [comments, setComments] = useState ([]) 
  

   useEffect(() => {
    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/posts/${postid}/comments`)
            const comments = res.data
            setComments(comments)
        } catch(err) {
            console.error(err)
        } 
    } 
    fetchComments()
  },[])

  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{comment.content}</li> 
 } )

 return (
    <ul>
       {renderedComments} 
    </ul>
 )

  } 

export default CommentsList