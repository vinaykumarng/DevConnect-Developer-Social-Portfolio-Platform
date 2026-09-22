/**
 * DevConnect seed script
 *
 * Populates the database with synthetic users, posts, comments, and follows
 * for local development/testing.
 *
 * Usage:
 *   1. Place this file at backend/scripts/seed.js
 *   2. Run: node scripts/seed.js
 *
 * WARNING: This wipes existing Users, Posts, Comments, and Follows before
 * seeding. Do NOT run this against a production database.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import Follow from '../models/follow.model.js';

dotenv.config();

const USERS = [
    {
        username: 'ada_codes',
        email: 'ada@example.com',
        password: 'password123',
        bio: 'Backend engineer. I make databases behave.',
        githubUsername: 'octocat',
    },
    {
        username: 'linus_dev',
        email: 'linus@example.com',
        password: 'password123',
        bio: 'Kernel hacker turned full-stack dev. Vim > everything.',
        githubUsername: 'torvalds',
    },
    {
        username: 'grace_hopper',
        email: 'grace@example.com',
        password: 'password123',
        bio: 'Compilers, debugging, and the occasional moth removal.',
        githubUsername: 'defunkt',
    },
    {
        username: 'margaret_ux',
        email: 'margaret@example.com',
        password: 'password123',
        bio: 'Frontend + design systems. Tailwind evangelist.',
        githubUsername: 'mojombo',
    },
    {
        username: 'dennis_c',
        email: 'dennis@example.com',
        password: 'password123',
        bio: 'Systems programmer. If it segfaults, I probably wrote it.',
        githubUsername: 'pjhyett',
    },
    {
        username: 'devops_dana',
        email: 'dana@example.com',
        password: 'password123',
        bio: 'CI/CD pipelines and infrastructure as code.',
        githubUsername: 'wycats',
    },
    {
        username: 'react_ravi',
        email: 'ravi@example.com',
        password: 'password123',
        bio: 'React, hooks, and way too many side projects.',
        githubUsername: 'ezmobius',
    },
    {
        username: 'newbie_nina',
        email: 'nina@example.com',
        password: 'password123',
        bio: 'Learning to code, one bug at a time. 🐣',
        githubUsername: '',
    },
];

const POST_TEMPLATES = [
    'Finally fixed that race condition that has been haunting me for two days. Turns out it was a missing await 🙃',
    'Hot take: tabs vs spaces doesn\'t matter as much as consistent formatting across the whole repo.',
    'Just shipped a new feature using {tech}. Really impressed with the DX so far.',
    'PSA: always read the error message fully before googling it. Saved me an hour today.',
    'Working on a side project this weekend — a {tech} app for tracking reading habits. Anyone interested in testing it?',
    'Code review tip: leave comments that explain *why*, not *what*. The diff already shows what changed.',
    'Migrated our API from REST to a cleaner resource-based structure. Small change, huge readability win.',
    'Debugging in production is a special kind of stress. Logs are your best friend.',
    'Learned about database indexing the hard way today — a query went from 4s to 40ms.',
    'Refactored a 400-line function into six small ones. My future self says thank you.',
    'Does anyone else write the tests first when they\'re stuck on a design decision? Helps me think.',
    'Deployed to production on a Friday. Living dangerously.',
    'Spent the morning reading source code instead of docs. Sometimes that\'s the faster path.',
    '{tech} has genuinely changed how I think about structuring apps. Worth the learning curve.',
    'Pair programming session today reminded me how much faster two brains solve hard bugs.',
];

const TECHS = ['TypeScript', 'GraphQL', 'Docker', 'Redis', 'Next.js', 'Postgres', 'WebSockets', 'Tailwind'];

const COMMENT_TEMPLATES = [
    'This is great, thanks for sharing!',
    'Had the exact same issue last week 😅',
    'Nice, bookmarking this.',
    'Curious how this performs at scale?',
    'Totally agree with this take.',
    'Can you share the repo?',
    'This is why I love this community.',
    'Underrated tip right here.',
    'Following your progress, keep it up!',
    'Same experience here, glad it\'s not just me.',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPostContent() {
    const template = randomItem(POST_TEMPLATES);
    return template.replace('{tech}', randomItem(TECHS));
}

async function seed() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI not found in .env — aborting.');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing Users, Posts, Comments, Follows...');
    await Promise.all([
        User.deleteMany({}),
        Post.deleteMany({}),
        Comment.deleteMany({}),
        Follow.deleteMany({}),
    ]);

    console.log('Creating users...');
    // Use .create() one by one (not insertMany) so the pre-save bcrypt hook runs
    const users = [];
    for (const userData of USERS) {
        const user = await User.create(userData);
        users.push(user);
    }
    console.log(`Created ${users.length} users (all passwords: "password123")`);

    console.log('Creating posts...');
    const posts = [];
    for (const user of users) {
        const postCount = randomInt(2, 5);
        for (let i = 0; i < postCount; i++) {
            const post = await Post.create({
                content: buildPostContent(),
                author: user._id,
            });
            posts.push(post);
        }
    }
    console.log(`Created ${posts.length} posts`);

    console.log('Creating comments...');
    let commentCount = 0;
    for (const post of posts) {
        const numComments = randomInt(0, 4);
        const commenters = users.filter((u) => u._id.toString() !== post.author.toString());

        for (let i = 0; i < numComments; i++) {
            const commenter = randomItem(commenters);
            await Comment.create({
                content: randomItem(COMMENT_TEMPLATES),
                author: commenter._id,
                post: post._id,
            });
            commentCount++;
        }
    }
    console.log(`Created ${commentCount} comments`);

    console.log('Creating follow relationships...');
    let followCount = 0;
    for (const follower of users) {
        const possibleTargets = users.filter((u) => u._id.toString() !== follower._id.toString());
        const numFollows = randomInt(1, 5);
        const shuffled = possibleTargets.sort(() => 0.5 - Math.random());
        const targets = shuffled.slice(0, numFollows);

        for (const target of targets) {
            try {
                await Follow.create({ follower: follower._id, following: target._id });
                followCount++;
            } catch (err) {
                // duplicate pair (unique index) — skip silently
            }
        }
    }
    console.log(`Created ${followCount} follow relationships`);

    console.log('\nSeed complete.');
    console.log('Sample login: ada@example.com / password123');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});