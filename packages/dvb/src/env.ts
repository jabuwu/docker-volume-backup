require('dotenv').config();
import * as env from 'env-var';

export const PORT = env.get('PORT').default('1998').asPortNumber();
export const DB_FILE = env.get('DB_FILE').default('./dvb.db').asString();
export const CORS_ORIGIN = env.get('CORS_ORIGIN').default('').asString();