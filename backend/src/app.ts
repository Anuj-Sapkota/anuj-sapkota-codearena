import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import "./utils/passport.strategy.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
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

console.log("Reached Services");

// Auth
app.use("/api/auth", authRoute);

//User
app.use("/api/user", userRoute);

app.use(errorHandler); //error handler middleware

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
