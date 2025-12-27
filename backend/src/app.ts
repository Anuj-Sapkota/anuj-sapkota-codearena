import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";

import authRoute from "./routes/authroute.js";
import config from "./configs/config.js";


const app = express();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000", 
  credentials: true,               
};

app.use(cors(corsOptions));

console.log("Reached Services");

// Auth
app.use("/api/auth", authRoute);

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
