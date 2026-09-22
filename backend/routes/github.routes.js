import express from 'express';
import { getUserRepos } from '../controller/github.controller.js';

const router = express.Router();

router.get('/:githubUsername/repos', getUserRepos);

export default router;