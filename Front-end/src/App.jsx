import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import HomePage from "./pages/hamepage.jsx"


const socket = io('http://localhost:5000'); 

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
  };

  return (
    <div>
      <h1>Socket.IO Chat</h1>
	<HomePage/>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
