import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import "./utils/passport.strategy.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import categoryRoute from "./routes/category.routes.js";
import problemRoute from "./routes/problem.routes.js"
import submissionRoutes from './routes/submission.routes.js';
import config from "./configs/config.js";
import { connectCloudinary } from "./configs/cloudinary.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
connectCloudinary();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:3000"], //DEVELOPMENT ONLY ____________________________________
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
app.use('/api/submissions', submissionRoutes);

app.use(errorHandler); //error handler middleware

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
