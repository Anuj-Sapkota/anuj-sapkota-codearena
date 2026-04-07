import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import "./utils/passport.strategy.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import categoryRoute from "./routes/category.routes.js";
import problemRoute from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import githubRoutes from "./routes/github.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import creatorRoutes from "./routes/creator.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import config from "./configs/config.js";
import { connectCloudinary } from "./configs/cloudinary.config.js";
import { errorHandler } from "./middleware/error.middleware.js";

import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "./errors/service.error.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import badgeRoutes from "./routes/badge.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import searchRoutes from "./routes/search.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
connectCloudinary();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:3000"], //________________DEVELOPMENT ONLY ____________________________________
  credentials: true,
};

app.use(cors(corsOptions));

// Auth
app.use("/api/auth", authRoute);

//User
app.use("/api/user", userRoute);

//Category
app.use("/api/categories", categoryRoute);

//Problems
app.use("/api/problems", problemRoute);

//Submission
app.use("/api/submissions", submissionRoutes);

//github
app.use("/api/github", githubRoutes);

//Challenges
app.use("/api/challenges", challengeRoutes);

//Discussion
app.use("/api/discussions", discussionRoutes);

//Creator
app.use("/api/creator", creatorRoutes);

//Upload
app.use("/api/upload", uploadRoutes);

//resource
app.use("/api/resources", resourceRoutes);

//payment
app.use("/api/payments", paymentRoutes);

app.use("/api/badge", badgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);

console.log("BACKEND123");
// This is the "Catch-All" middleware
app.use(notFoundHandler);
console.log("BACKEND456");

app.use(errorHandler); //error handler middleware

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
