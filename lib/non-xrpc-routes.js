
import { Router } from "express";

// A set of routes to set up before the XRPC ones for ATProto and friends.
// Initially these are mostly for very basic things that the Bluesky PDS does (in case anyone cares)
// but this ought to also serve stuff like tiles routes and the such.
export default function createRouter () {
  const router = new Router();
  router.get('/', (req, res) => {
    res.type('text/plain');
    res.send('This is an AT Protocol PDS: https://github.com/darobin/polypod-wnfs.\n');
  });
  // no crawling here for now
  router.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDeny: /\n');
  });
  // if I'm alive we're alive
  router.get('/xrpc/_health', (req, res) => {
    res.send({ version: '0.0.0' });
  });
  return router;
}
