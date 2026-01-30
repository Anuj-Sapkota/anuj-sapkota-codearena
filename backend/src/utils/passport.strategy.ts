import passport, { type Profile } from "passport";
import type { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { VerifyCallback } from "passport-oauth2";
import config from "../configs/config.js";
import authService from "../services/auth.service.js";

/**
 * Helper to extract userId from the OAuth state parameter.
 * This is crucial for linking accounts when using JWTs (session: false).
 */
const getUserIdFromState = (req: Request) => {
  if (req.query.state) {
    try {
      // Decode the base64 string sent back by the provider
      const stateData = JSON.parse(
        Buffer.from(req.query.state as string, "base64").toString()
      );
      if (stateData.userId) {
        return { userId: stateData.userId };
      }
    } catch (err) {
      console.error("OAuth State parsing error:", err);
    }
  }
  return null;
};

// --- Google Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true,
    },
    async (req, accessToken, _refreshToken, profile, done) => {
      try {
        // Check if this is a linking request by looking at the state
        const currentUser = getUserIdFromState(req);

        const user = await authService.findOrCreateOAuthUser(
          profile,
          "google",
          accessToken,
          currentUser || req.user // Use state-userId or req.user if available
        );
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// --- Github Strategy ---
passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
      scope: ["user:email", "repo"], // 'repo' scope is required for pushing code
      passReqToCallback: true,
    },
    async (req: Request, accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // Check if this is a linking request by looking at the state
        const currentUser = getUserIdFromState(req);

        const user = await authService.findOrCreateOAuthUser(
          profile,
          "github",
          accessToken,
          currentUser || req.user // Use state-userId or req.user if available
        );
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;