import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/mongodb.js';
import authRoutes from './routes/auth.routes.js';
import { PORT } from './config/env.js';
import cors from 'cors';

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/', (req, res, next) => {
  res.send('Hello world');
});

app.listen(PORT, async (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`app is listening on the port http://localhost:${PORT}`);
    await connectDB();
  }
});
