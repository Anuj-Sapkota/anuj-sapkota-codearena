import dotenv from "dotenv";

dotenv.config();


const saltRound = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const config = {
    // databaseUrl: process.env.DATABASE_URL || "", 
    port: process.env.PORT || "5000",
    saltRound
}

export default config;