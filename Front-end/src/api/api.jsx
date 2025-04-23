const getMessages = async (conversationId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/message/${conversationId}`, {
      method: 'GET',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error; 
  }
};

