import React from 'react'
import { useState } from 'react'
import './home.scss'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  const [ID, setID] = useState('');

  const createRoom = async () => {
    try {
      const {data:{id}} = await axios.get('http://localhost:8080/create_room');
      navigate(`/chat/${id}`);
    }catch(error) {
      console.log(error);
    }
  }

  const joinRoom = () => {
    navigate(`/chat/${ID}`)
  }

  return (
  <div className='container-md d-flex flex-column align-items-center justify-content-center' style={{paddingTop: "300px"}}>
    <form className='mb-3'>
        <input type="text" className='form-control form-control-lg mb-3 fs-2 border border-4' aria-label=".form-control-lg example" placeholder='Enter Room ID' value={ID} onChange={(e) => setID(e.target.value)} />
        
        <div className="text-center">
            <button className='btn btn-outline-primary btn-lg fs-3 border border-3 border-primary'  type='submit' onClick={joinRoom}>Join</button>
        </div>
    </form>

    <div className='display-5 mb-3'>or</div>

    <div className="text-center">
        <button className='btn btn-outline-primary btn-lg fs-3 border border-3 border-primary'  type='submit' onClick={createRoom}>Create New Room</button>
    </div>
  </div>  
  )
}

export default Home