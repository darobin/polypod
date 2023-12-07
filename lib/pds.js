
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import events from 'events';
import { createServer } from '@atproto/xrpc-server';
import Data from './data.js';
import Auth from './auth.js';
import DID from './did.js';
import { loggerMiddleware, errorHandler } from './logger.js';
import { PDS_PORT } from './config.js';
import createNonXRPCRouter from './non-xrpc-routes.js';
// import { makeCreateAccount } from './com/atproto/server/createAccount.js';
import makeCreateInviteCode from './com/atproto/server/createInviteCode.js';

export default class PDS {
  constructor (ctx, app, xrpc) {
    this.ctx = ctx;
    this.app = app;
    this.xrpc = xrpc;
  }
  static async create (opt) {
    if (!opt.storeDir) throw new Error(`Must specify storeDir.`);
    if (!opt.adminPassword) throw new Error(`Must specify adminPassword.`);
    // ~•~•~°°° reminder that this is NOT meant to run in production °°°~•~•~
    const auth = new Auth({
    //   jwtSecret: opt.jwtSecret,
      adminPassword: opt.adminPassword,
    //   moderatorPass: opt.moderatorPassword || 'hunter2',
    //   triagePass: opt.triagePassword || 'hunter2',
    });
    const data = new Data(opt.storeDir);
    const did = new DID(data);
    await data.open();
    const ctx = {
      port: opt.port || PDS_PORT,
      data,
      auth,
      did,
    };
    const app = express();
    app.set('x-powered-by', false);
    app.set('trust proxy', true)
    app.use(cors());
    app.use(loggerMiddleware);
    app.use(compression());
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
    const pds = new PDS(ctx, app, xrpc);
    // These are all the com.atproto.* methods. They are created in a privileged way that has
    // full access to internals. All others need to go through an interface that keeps them
    // safe when executing arbitrary WASM.
    [
      makeCreateInviteCode,
      // makeCreateAccount,
    ]
      .forEach(methodCreator => {
        const xrpcConfig = methodCreator(pds);
        xrpc.addLexicon(xrpcConfig.lexicon);
        xrpc.addMethod(xrpcConfig.nsid, xrpcConfig);
      })
    ;
    app.use(xrpc.router);
    app.use(errorHandler);

    return pds;
  }
  async start () {
    const server = this.app.listen(this.ctx.port);
    this.ctx.server = server;
    await events.once(server, 'listening');
    console.warn(`PDS running at http://localhost:${this.ctx.port}`);
  }
  async destroy () {
    return new Promise((resolve, reject) => {
      this.ctx.server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
        
    });
  }
}
