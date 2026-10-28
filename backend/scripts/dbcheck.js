// backend/scripts/dbcheck.js
// Smoke test for the new Postgres schema. Run from backend/:
//   node scripts/dbcheck.js
//
// It creates a few throwaway rows (usernames start with "dbcheck_"),
// checks that the database enforces the rules we care about, then cleans up.

import prisma from '../database/prisma.js';

async function expectFailure(label, fn) {
    try {
        await fn();
        console.log(`FAIL  ${label}: expected an error but it succeeded`);
        process.exitCode = 1;
    } catch (err) {
        const reason = err.code ?? err.message.trim().split('\n').pop();
        console.log(`ok    ${label} (blocked: ${reason})`);
    }
}

async function main() {
    // Clean leftovers from a previous run
    await prisma.user.deleteMany({ where: { username: { startsWith: 'dbcheck_' } } });

    const ada = await prisma.user.create({
        data: { username: 'dbcheck_ada', email: 'dbcheck_ada@example.com' },
    });
    const bob = await prisma.user.create({
        data: { username: 'dbcheck_bob', email: 'dbcheck_bob@example.com' },
    });
    console.log('ok    created two users with generated UUIDs:', ada.id, bob.id);

    // 1. Unique constraint
    await expectFailure('duplicate username is rejected', () =>
        prisma.user.create({
            data: { username: 'dbcheck_ada', email: 'someone_else@example.com' },
        })
    );

    // 2. Relations: post + comment, read back with a JOIN
    const post = await prisma.post.create({
        data: { content: 'hello from postgres', authorId: ada.id },
    });
    await prisma.comment.create({
        data: { content: 'nice post', postId: post.id, authorId: bob.id },
    });

    const loaded = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
            author: { select: { username: true } },
            comments: { include: { author: { select: { username: true } } } },
        },
    });
    console.log(
        `ok    post by ${loaded.author.username} has ${loaded.comments.length} comment(s), first from ${loaded.comments[0].author.username}`
    );

    // 3. Follows: composite primary key + CHECK constraint
    await prisma.follow.create({ data: { followerId: bob.id, followingId: ada.id } });
    console.log('ok    bob now follows ada');

    await expectFailure('following the same user twice is rejected', () =>
        prisma.follow.create({ data: { followerId: bob.id, followingId: ada.id } })
    );

    await expectFailure('following yourself is rejected (CHECK constraint)', () =>
        prisma.follow.create({ data: { followerId: ada.id, followingId: ada.id } })
    );

    // 4. Cascade: deleting ada should remove her post, the comments on it, and follows pointing at her
    await prisma.user.delete({ where: { id: ada.id } });

    const [postsLeft, commentsLeft, followsLeft] = await Promise.all([
        prisma.post.count({ where: { authorId: ada.id } }),
        prisma.comment.count({ where: { postId: post.id } }),
        prisma.follow.count({ where: { followingId: ada.id } }),
    ]);

    if (postsLeft === 0 && commentsLeft === 0 && followsLeft === 0) {
        console.log('ok    deleting a user cascaded to their posts, comments and follows');
    } else {
        console.log(
            `FAIL  cascade: posts=${postsLeft} comments=${commentsLeft} follows=${followsLeft}`
        );
        process.exitCode = 1;
    }

    // Cleanup
    await prisma.user.delete({ where: { id: bob.id } });
    console.log(process.exitCode ? '\nSome checks failed.' : '\nAll checks passed.');
}

main()
    .catch((err) => {
        console.error('dbcheck crashed:', err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());