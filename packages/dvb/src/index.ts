import 'reflect-metadata';
import './db';
import { PORT, CORS_ORIGIN } from './env';
import { createServer } from 'http';
import { apollo } from './graphql';
import express from 'express';
import cors from 'cors';
import { middleware as downloadMiddleware } from './download';

const app = express();
app.use(cors(CORS_ORIGIN ? { origin: CORS_ORIGIN } : {}));
app.use('/api/download', downloadMiddleware);
apollo.applyMiddleware({ app, cors: false });
const server = createServer(app);
apollo.installSubscriptionHandlers(server);
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});