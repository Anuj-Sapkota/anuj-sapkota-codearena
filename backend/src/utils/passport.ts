import passport, { type Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { Profile as GitHubProfile } from "passport-github2";
import type { VerifyCallback } from "passport-oauth2";
import config from "../configs/config.js";
import authService from "../services/authService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateOAuthUser(profile, "google");
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

//Github
passport.use(
    new GitHubStrategy(
        {
            clientID: config.github.clientID,
            clientSecret: config.github.clientSecret,
            callbackURL: config.google.callbackURL,
            scope: ["user: email"]
        },
        async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const user = await authService.findOrCreateOAuthUser(profile, "github");
                return done(null, user);
            } catch (err) {
                return done(err, undefined)
            }
        }
    )
)
export default passport;