import "dotenv/config";
import { betterAuth } from "better-auth";
import db from "../db.js";

export const auth = betterAuth({
  database: db,

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },
});
