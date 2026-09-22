import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/mongodb.js';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import { PORT } from './config/env.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from "./routes/post.routes.js";
import followRoutes from "./routes/follow.routes.js";
import githubRoutes from "./routes/github.routes.js";
import commentRoutes from "./routes/comment.routes.js";

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/comments', commentRoutes);

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
