require('dotenv').config();
import * as env from 'env-var';

export const PORT = env.get('PORT').default('1998').asPortNumber();
export const DB_FILE = env.get('DB_FILE').default('./data/dvb.db').asString();
export const BACKUPS_DIR = env.get('BACKUPS_DIR').default('./data/backups').asString();
export const CORS_ORIGIN = env.get('CORS_ORIGIN').default('').asString();