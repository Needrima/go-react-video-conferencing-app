import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Home from './components/home/Home';
import Chat from './components/chat/Chat';

function App() {
  return (
    <Routes>
      <Route path='/' exact element={<Home />} />
      <Route path='/chat/:id' exact element={<Chat />} />
    </Routes>
  );
}

export default App;
