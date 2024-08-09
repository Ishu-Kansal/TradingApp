import dotenv from "dotenv";

dotenv.config();
import pgPromise from "pg-promise";

const pgp = pgPromise({}); // Empty object means no additional config required

const config = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB_PT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const dbPT = pgp(config);

export default dbPT;
