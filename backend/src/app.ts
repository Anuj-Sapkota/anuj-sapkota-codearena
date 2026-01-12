import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import "./utils/passport.js";
import authRoute from "./routes/authroute.js";
import userRoute from "./routes/userRoute.js";
import config from "./configs/config.js";
import { connectCloudinary } from "./configs/cloudinaryConfig.js";

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
app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
