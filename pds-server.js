
import express from 'express';
import { createServer } from '@atproto/xrpc-server';
import { PDS_PORT } from './lib/config.js';
import createNonXRPCRouter from './lib/non-xrpc-routes.js';

const app = express();
app.use(createNonXRPCRouter());

const xrpc = createServer([]); // no lexicons for now
app.use(xrpc.router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`BOOM: ${err.message}`);
  next(err);
});
app.listen(PDS_PORT, () => console.warn(`PDS running at http://localhost:${PDS_PORT}`));
