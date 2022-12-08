// put in src directory

import path from "path";

export const SERVER_HOST = "localhost";
export const SERVER_PORT = 5000;

export const DB_HOST = "localhost";
export const DB_PORT = 3306;

export const DB_DATABASE = "";
export const DB_USERNAME = "";
export const DB_PASSWORD = "";

/** 6 hours */
export const MAX_LOGIN_TIME_MS = 21600000;
/** 10 seconds */
export const INDIVIDUAL_LOGGING_COOLDOWN_MS = 10000;

export const MINIMUM_ATTENDANCE_TIME_MS = 252000000;

export const CSV_PATH = path.join(__dirname, "../export.csv");

export const CLIENT_EMAIL = "";
export const PRIVATE_KEY = "";