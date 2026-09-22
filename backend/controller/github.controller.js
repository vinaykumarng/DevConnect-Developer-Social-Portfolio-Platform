export const getUserRepos = async (req, res) => {
    try {
        const { githubUsername } = req.params;

        const response = await fetch(
            `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    // Optional but recommended: add a token to raise the rate limit
                    // from 60/hr (unauthenticated) to 5000/hr
                    ...(process.env.GITHUB_TOKEN && {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    }),
                },
            }
        );

        if (response.status === 404) {
            return res.status(404).json({ message: 'GitHub user not found' });
        }

        if (response.status === 403) {
            return res.status(429).json({ message: 'GitHub API rate limit exceeded, try again later' });
        }

        if (!response.ok) {
            return res.status(502).json({ message: 'Failed to fetch repos from GitHub' });
        }

        const data = await response.json();

        // Trim to only the fields the frontend actually needs
        const repos = data
            .filter((repo) => !repo.fork) // skip forked repos, keep only original work
            .map((repo) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updatedAt: repo.updated_at,
            }))
            .sort((a, b) => b.stars - a.stars); // most-starred first

        res.status(200).json({ repos });
    } catch (err) {
        console.error('GitHub fetch error:', err);
        res.status(500).json({ message: 'Server error fetching GitHub repos' });
    }
};