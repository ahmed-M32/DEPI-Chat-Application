import React, { useState, useEffect } from 'react';
import { getMessages } from '../../api/api';

const HomePage = () => {
  const [messages, setMessages] = useState([]);
  const conversationId = '65e3d5a890c47853070380f3';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div> 
      {messages.map((message) => (
        <p key={message._id}>
          {message.text}
        </p>
      ))}
    </div> 
  );
};

export default HomePage;