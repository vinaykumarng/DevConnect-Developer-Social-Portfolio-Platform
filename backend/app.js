import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

import { PORT } from './config/env.js';
const app = express();

app.use('/', (req, res, next) => {
  res.send('Hello world');
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`app is listening on the port http://localhost:${PORT}`);
  }
});
