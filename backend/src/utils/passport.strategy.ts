import passport, { type Profile } from "passport";
import type { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { VerifyCallback } from "passport-oauth2";
import config from "../configs/config.js";
import authService from "../services/auth.service.js";

// Google
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true, // Key for linking
    },
    // The first argument is now 'req'
    async (req, _accessToken, _refreshToken, profile, done) => {
      try {
        // req.user contains the session data if the user is already logged in
        const user = await authService.findOrCreateOAuthUser(profile, "google", req.user);
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// Github
passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
      scope: ["user:email"],
      passReqToCallback: true, // Add this for GitHub linking too
    },
    async (req: Request, _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const user = await authService.findOrCreateOAuthUser(profile, "github", req.user);
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;