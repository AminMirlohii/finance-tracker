const path = require("path"); // imports Node's built-in path module

const dotenv = require("dotenv"); // imports dotenv library

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = nodeEnv === "test" ? ".env.test" : ".env";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });


const requiredVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET"];

for (const key of requiredVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

module.exports = {
    env: nodeEnv,
    port: Number(process.env.PORT) || 4000,
    database: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
};