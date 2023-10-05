
import express from 'express';
import events from 'events';
import { createServer } from '@atproto/xrpc-server';
import { ServerAuth } from '@atproto/pds/dist/auth.js';
import Data from './data.js';
import { PDS_PORT } from './config.js';
import createNonXRPCRouter from './non-xrpc-routes.js';
import { makeCreateAccount } from './com/atproto/server/createAccount.js';

export default class PDS {
  constructor (ctx, app, xrpc) {
    this.ctx = ctx;
    this.app = app;
    this.xrpc = xrpc;
  }
  static async create (opt) {
    if (!opt.storeDir) throw new Error(`Must specify storeDir.`);
    // ~•~•~°°° reminder that this is NOT meant to run in production °°°~•~•~
    const auth = new ServerAuth({
      jwtSecret: opt.jwtSecret,
      adminPass: opt.adminPassword || 'hunter2',
      moderatorPass: opt.moderatorPassword || 'hunter2',
      triagePass: opt.triagePassword || 'hunter2',
    });
    const ctx = {
      port: opt.port || PDS_PORT,
      data: new Data(opt.storeDir),
      auth,
      roleVerifier: auth.roleVerifier(auth),
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
    // These are all the com.atproto.* methods. They are created in a privileged way that has
    // full access to internals. All others need to go through an interface that keeps them
    // safe when executing arbitrary WASM.
    [
      makeCreateAccount,
    ]
      .forEach(methodCreator => {
        const xrpcConfig = methodCreator(this);
        xrpc.addLexicon(xrpcConfig.lexicon);
        xrpc.addMethod(xrpcConfig.nsid, xrpcConfig);
      })
    ;
    app.use(xrpc.router);

    return new PDS(ctx, app, xrpc);
  }
  async start () {
    const server = this.app.listen(this.ctx.port);
    await events.once(server, 'listening')
    console.warn(`PDS running at http://localhost:${this.ctx.port}`);
  }
}
