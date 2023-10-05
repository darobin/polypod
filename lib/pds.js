
import express from 'express';
import events from 'events';
import { createServer } from '@atproto/xrpc-server';
import { PDS_PORT } from './config.js';
import createNonXRPCRouter from './non-xrpc-routes.js';

export default class PDS {
  constructor (ctx, app, xrpc) {
    this.ctx = ctx;
    this.app = app;
    this.xrpc = xrpc;
  }
  static async create (opt) {
    if (!opt.storeDir) throw new Error(`Must specify storeDir.`);
    const ctx = {
      port: opt.port || PDS_PORT,
    };
    const app = express();
    app.set('x-powered-by', false);
    app.use(express.json());
    app.use((req, res, next) => {
      console.warn(`${req.method} ${req.path}`);
      if (req.body) console.warn(req.body);
      next();
    });
    app.use(createNonXRPCRouter());

    const xrpc = createServer(
      [], // no lexicons for now
      {
        validateResponse: true, // for now, remove later if needed
        payload: {
          jsonLimit: 100 * 1024, // 100kb
          textLimit: 100 * 1024, // 100kb
          blobLimit: 5 * 1024 * 1024, // 5mb
        },
      }
    );
    app.use(xrpc.router);

    return new PDS(ctx, app, xrpc);
  }
  async start () {
    const server = this.app.listen(this.ctx.port);
    await events.once(server, 'listening')
    console.warn(`PDS running at http://localhost:${this.ctx.port}`);
  }
}
