// backend/middleware/passport.middleware.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../database/prisma.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const displayName = profile.displayName || email.split('@')[0];
                const avatarUrl = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found from Google profile'), null);
                }

                // Check if OAuth account already exists
                let oauthAccount = await prisma.oAuthAccount.findUnique({
                    where: {
                        provider_providerUserId: {
                            provider: 'google',
                            providerUserId: googleId,
                        },
                    },
                    include: {user: true},
                });

                if (oauthAccount) {
                    return done(null, oauthAccount.user);
                }

                // Check if user already exists by email
                let user = await prisma.user.findUnique({
                    where: {email},
                });

                if (!user) {
                    let baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (baseUsername.length < 3) baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    let username = baseUsername;
                    let counter = 1;

                    while (await prisma.user.findUnique({where: {username}})) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }

                    user = await prisma.user.create({
                        data: {
                            username,
                            email,
                            avatarUrl,
                        },
                    });
                }

                // Link OAuth account
                await prisma.oAuthAccount.create({
                    data: {
                        userId: user.id,
                        provider: 'google',
                        providerUserId: googleId,
                    },
                });

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
)

export default passport;
