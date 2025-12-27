import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../configs/config.js";
import authService from "../services/authService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateOAuthUser(profile, "google");
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;