import api from './api';

export const fetchGithubRepos = (githubUsername) =>
    api.get(`/github/${githubUsername}/repos`);