/**
 * DevConnect seed script (Prisma / PostgreSQL)
 *
 * Usage (from backend/):   node scripts/seed.js
 *
 * Wipes users, posts, comments, follows and oauth_accounts, then fills them with
 * synthetic data. Every seeded account has the password "password123".
 *
 * WARNING: destructive. Never run this against a database you care about.
 */

import bcrypt from 'bcrypt';
import prisma from '../database/prisma.js';

const PASSWORD = 'password123';

const USERS = [
    { username: 'ada_codes', email: 'ada@example.com', bio: 'Backend engineer. I make databases behave.', githubUsername: 'octocat' },
    { username: 'linus_dev', email: 'linus@example.com', bio: 'Kernel hacker turned full-stack dev. Vim > everything.', githubUsername: 'torvalds' },
    { username: 'grace_hopper', email: 'grace@example.com', bio: 'Compilers, debugging, and the occasional moth removal.', githubUsername: 'defunkt' },
    { username: 'margaret_ux', email: 'margaret@example.com', bio: 'Frontend + design systems. Tailwind evangelist.', githubUsername: 'mojombo' },
    { username: 'dennis_c', email: 'dennis@example.com', bio: 'Systems programmer. If it segfaults, I probably wrote it.', githubUsername: 'pjhyett' },
    { username: 'devops_dana', email: 'dana@example.com', bio: 'CI/CD pipelines and infrastructure as code.', githubUsername: 'wycats' },
    { username: 'react_ravi', email: 'ravi@example.com', bio: 'React, hooks, and way too many side projects.', githubUsername: 'ezmobius' },
    { username: 'newbie_nina', email: 'nina@example.com', bio: 'Learning to code, one bug at a time.', githubUsername: '' },
];

const POST_TEMPLATES = [
    'Finally fixed that race condition that has been haunting me for two days. Turns out it was a missing await.',
    "Hot take: tabs vs spaces doesn't matter as much as consistent formatting across the whole repo.",
    'Just shipped a new feature using {tech}. Really impressed with the DX so far.',
    'PSA: always read the error message fully before googling it. Saved me an hour today.',
    'Working on a side project this weekend: a {tech} app for tracking reading habits. Anyone interested in testing it?',
    'Code review tip: leave comments that explain *why*, not *what*. The diff already shows what changed.',
    'Migrated our API from REST to a cleaner resource-based structure. Small change, huge readability win.',
    'Debugging in production is a special kind of stress. Logs are your best friend.',
    'Learned about database indexing the hard way today: a query went from 4s to 40ms.',
    'Refactored a 400-line function into six small ones. My future self says thank you.',
    "Does anyone else write the tests first when they're stuck on a design decision? Helps me think.",
    'Deployed to production on a Friday. Living dangerously.',
    "Spent the morning reading source code instead of docs. Sometimes that's the faster path.",
    '{tech} has genuinely changed how I think about structuring apps. Worth the learning curve.',
    'Pair programming session today reminded me how much faster two brains solve hard bugs.',
];

const TECHS = ['TypeScript', 'GraphQL', 'Docker', 'Redis', 'Next.js', 'Postgres', 'WebSockets', 'Tailwind'];

const COMMENT_TEMPLATES = [
    'This is great, thanks for sharing!',
    'Had the exact same issue last week.',
    'Nice, bookmarking this.',
    'Curious how this performs at scale?',
    'Totally agree with this take.',
    'Can you share the repo?',
    'This is why I love this community.',
    'Underrated tip right here.',
    'Following your progress, keep it up!',
    "Same experience here, glad it's not just me.",
];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDateWithinDays = (days) => new Date(Date.now() - Math.random() * days * DAY);
// A moment after `date`, but never in the future
const laterThan = (date) => new Date(Math.min(Date.now(), date.getTime() + randomInt(1, 72) * HOUR));

const buildPostContent = () => randomItem(POST_TEMPLATES).replace('{tech}', randomItem(TECHS));

async function seed() {
    console.log('Clearing existing data...');
    // Deleting users cascades to posts, comments, follows and oauth_accounts
    await prisma.user.deleteMany();

    console.log('Creating users...');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const users = [];
    for (const u of USERS) {
        const user = await prisma.user.create({
            data: { ...u, githubUsername: u.githubUsername || null, passwordHash },
        });
        users.push(user);
    }
    console.log(`  ${users.length} users`);

    console.log('Creating posts...');
    const posts = [];
    for (const user of users) {
        const count = randomInt(2, 5);
        for (let i = 0; i < count; i++) {
            const post = await prisma.post.create({
                data: {
                    content: buildPostContent(),
                    authorId: user.id,
                    createdAt: randomDateWithinDays(14), // spreads the feed over two weeks
                },
            });
            posts.push(post);
        }
    }
    console.log(`  ${posts.length} posts`);

    console.log('Creating comments...');
    const comments = [];
    for (const post of posts) {
        const commenters = users.filter((u) => u.id !== post.authorId);
        const count = randomInt(0, 4);
        for (let i = 0; i < count; i++) {
            comments.push({
                content: randomItem(COMMENT_TEMPLATES),
                postId: post.id,
                authorId: randomItem(commenters).id,
                createdAt: laterThan(post.createdAt),
            });
        }
    }
    await prisma.comment.createMany({ data: comments });
    console.log(`  ${comments.length} comments`);

    console.log('Creating follows...');
    const follows = [];
    for (const follower of users) {
        const targets = users
            .filter((u) => u.id !== follower.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, randomInt(1, 5));
        for (const target of targets) {
            follows.push({ followerId: follower.id, followingId: target.id });
        }
    }
    await prisma.follow.createMany({ data: follows, skipDuplicates: true });
    console.log(`  ${follows.length} follows`);

    console.log('\nSeed complete. Log in with e.g. ada@example.com / password123');
}

seed()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());