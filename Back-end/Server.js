import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('API is running!'));

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));