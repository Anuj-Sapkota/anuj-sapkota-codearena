import dotenv from "dotenv";

dotenv.config();

const config = {
    // databaseUrl: process.env.DATABASE_URL || "", 
    port: process.env.PORT || "5000"
}

export default config;