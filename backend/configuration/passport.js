import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../model/index.js";
import { genToken } from "../helper/genToken.js";
import { configDotenv } from "dotenv";

configDotenv();
// Configure Passport with Google strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/users/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get user profile data
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0]?.value;

        // Check if user already exists by email (preferred) or Google ID
        let user = await User.findOne({
          where: {
            email,
          },
        });

        // If user exists by email but doesn't have googleId set
        if (user && !user.googleId) {
          // Link Google account to existing user
          await user.update({
            googleId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }

        // If no user found, create a new one
        if (!user) {
          user = await User.create({
            googleId: id,
            name: displayName,
            email,
            profilePicture,
            password:
              Math.random().toString(36).slice(-12) +
              Math.random().toString(36).slice(-12),
            isVerified: true, // Email is verified through Google
          });
        }

        // Generate token and return user with token
        const token = genToken(user.id);

        return done(null, { user, token });
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, false);
      }
    }
  )
);

// Configure Passport with GitHub strategy
passport.use(
  "github",
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get user profile data
        const { id, displayName, username, photos, emails } = profile;

        // GitHub may not provide email directly - need to handle this case
        const email =
          emails && emails[0]?.value
            ? emails[0].value
            : `${username}@github.users.noreply.com`;

        const profilePicture = photos[0]?.value;

        // Check if user already exists by email or GitHub ID
        let user = await User.findOne({
          where: {
            email,
          },
        });

        // If user exists but doesn't have githubId set
        if (user && !user.githubId) {
          // Link GitHub account to existing user
          await user.update({
            githubId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }

        // If no user found, create a new one
        if (!user) {
          user = await User.create({
            githubId: id,
            name: displayName || username,
            email,
            profilePicture,
            password:
              Math.random().toString(36).slice(-12) +
              Math.random().toString(36).slice(-12),
            isVerified: true, // Email is verified through GitHub
          });
        }

        // Generate token and return user with token
        const token = genToken(user.id);

        return done(null, { user, token });
      } catch (error) {
        console.error("GitHub auth error:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
