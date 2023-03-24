import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Chat = () => {
    const id = useParams()['id']

    useEffect(() => {
      (async () => {
        try {
          const {data:{valid}} = await axios.get(`http://localhost:8080/validate_room_id/${id}`);
          console.log(valid);
        }catch(error) {
          console.log(error)
        }
      })();
    })
  return (
    <div>Chat {id}</div>
  )
}

export default Chat