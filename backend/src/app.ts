import express from "express";
import cookieParser from 'cookie-parser';

import authRoute from "./routes/authroute.js";
import config from "./configs/config.js";


const app = express();

app.use(cookieParser());
app.use(express.json());

console.log("Reached Services");

// Auth
app.use("/api/auth", authRoute);

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
