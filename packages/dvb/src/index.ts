import 'reflect-metadata';
import './db';
import { PORT } from './env';
import { createServer } from 'http';
import { apollo } from './graphql';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
apollo.applyMiddleware({ app, cors: false });
const server = createServer(app);
apollo.installSubscriptionHandlers(server);
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});