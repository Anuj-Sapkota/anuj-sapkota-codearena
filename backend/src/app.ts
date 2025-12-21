import express from "express";

import authRoute from "./routes/authroute.js";
import config from "./configs/config.js";

const app = express();

app.use(express.json);

// Auth
app.use("/api/auth", authRoute);

app.listen(config.port, () => {
  console.log(`Server running at port ${config.port}...`);
});
