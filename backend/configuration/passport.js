import passport from "passport";
import { Strategy as GoogleStrat } from "passport-google-oauth20";
import { Strategy as GitHubStrat } from "passport-github2";
import { User, Company } from "../model/model.js";
import { genToken } from "../helper/genToken.js";
import { configDotenv } from "dotenv";
import crypto from "crypto";

configDotenv();


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
        // Google SSO login for email

        if (!user) {
          // Only allow SSO if user already exists
          return done(
            new Error(
              "SSO is only allowed for existing users. Please contact your company admin for an invite."
            ),
            false
          );
        }
        if (!user.companyId) {
          return done(
            new Error(
              "User does not belong to any company. Please contact your company admin."
            ),
            false
          );
        }
        // Optionally update googleId/profilePicture if missing
        if (!user.googleId) {
          await user.update({
            googleId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }
        const company = await Company.findOne({
          where: { companyId: user.companyId },
        });
        // Company found
        if (!company) {
          return done(new Error("Company not found for user"), false);
        }
        const token = genToken(user.id, company.companyCode, company.id);
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
        // GitHub SSO login for email

        if (!user) {
          // Only allow SSO if user already exists
          return done(
            new Error(
              "SSO is only allowed for existing users. Please contact your company admin for an invite."
            ),
            false
          );
        }
        if (!user.companyId) {
          return done(
            new Error(
              "User does not belong to any company. Please contact your company admin."
            ),
            false
          );
        }
        // Optionally update githubId/profilePicture if missing
        if (!user.githubId) {
          await user.update({
            githubId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }
        const company = await Company.findOne({
          where: { companyId: user.companyId },
        });
        // Company found
        if (!company) {
          return done(new Error("Company not found for user"), false);
        }
        const token = genToken(user.id, company.companyCode, company.id);
        return done(null, { user, token });
      } catch (error) {
        console.error("GitHub auth error:", error);
        return done(error, false);
      }
    }
  )
);

export default passport;
