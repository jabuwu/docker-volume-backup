import 'reflect-metadata';
import { PORT } from './env';
import { createServer } from 'http';
import { apollo } from './graphql';
import express from 'express';
import './db';

const app = express();
apollo.applyMiddleware({ app, cors: false });
const server = createServer(app);
apollo.installSubscriptionHandlers(server);
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});