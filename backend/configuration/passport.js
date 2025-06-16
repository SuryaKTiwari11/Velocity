import passport from "passport";
import { Strategy as GoogleStrat } from "passport-google-oauth20";
import { Strategy as GitHubStrat } from "passport-github2";
import { User } from "../model/model.js";
import { genToken } from "../helper/genToken.js";
import { configDotenv } from "dotenv";
import crypto from "crypto";

configDotenv();
const randomPass = () => {
  return crypto.randomBytes(16).toString("hex");
};

passport.use(
  "google",
  new GoogleStrat(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0]?.value;
        let user = await User.findOne({ where: { email } });

        if (user && !user.googleId) {
          await user.update({
            googleId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }

        if (!user) {
          user = await User.create({
            googleId: id,
            name: displayName,
            email,
            profilePicture,
            password: randomPass(),
            isVerified: true,
          });
        }

        const token = genToken(user.id);
        return done(null, { user, token });
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, false);
      }
    }
  )
);

passport.use(
  "github",
  new GitHubStrat(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, username, photos, emails } = profile;
        const email =
          emails && emails[0]?.value
            ? emails[0].value
            : `${username}@github.users.noreply.com`;
        const profilePicture = photos[0]?.value;

        let user = await User.findOne({
          where: { email },
        });

        if (user && !user.githubId) {
          await user.update({
            githubId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }

        if (!user) {
          user = await User.create({
            githubId: id,
            name: displayName || username,
            email,
            profilePicture,
            password: randomPass(),
            isVerified: true,
          });
        }

        const token = genToken(user.id);
        return done(null, { user, token });
      } catch (error) {
        console.error("GitHub auth error:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
