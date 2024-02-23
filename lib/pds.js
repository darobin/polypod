
import { readFile } from 'node:fs/promises';
import express from "express";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";

export default class PDS {
  // conf:
  //  - jwtSecret
  //  - didPLC
  //  - appViewDomain
  //  - privateKeyPath
  //  - handle
  //  - password
  //  - email
  static async createPDS (conf) {
    // take a configuration and set it up
    const pds = new PDS(conf);
    conf.privateKeyBytes = await readFile(conf.privateKeyPath);
    return pds;
  }
  constructor (conf) {
    this.conf = conf;
    const app = express();
    const authz = [
      expressjwt({
        secret: conf.jwtSecret,
        algorithms: ["HS256"],
        // onExpired: we can handle this, it's not clear from the docs if it defaults to rejecting expired
        // picopds also checks issue times `iat` in the future
      }),
      function auth (req, res, next) {
        if (req.auth?.scope !== 'com.atproto.access') res.status(401).json({ err: 'Invalid JWT scope' });
        if (!req.auth?.sub) res.status(401).json({ err: 'Invalid JWT: no subject' });
        if (req.auth?.sub !== conf.didPLC) res.status(401).json({ err: 'Invalid JWT auth subject' });
        next();
      },
    ];
    app.get ("/xrpc/com.atproto.identity.resolveHandle",  authz,  this.identityResolveHandle()); // XXX
    app.get ("/xrpc/com.atproto.server.describeServer",           this.serverDescribeServer());
    app.post("/xrpc/com.atproto.server.createSession",            this.serverCreateSession());
    app.get ("/xrpc/com.atproto.server.getSession",       authz,  this.serverGetSession()); // XXX
    app.get ("/xrpc/com.atproto.sync.subscribeRepos",             this.syncSubscribeRepos()); // XXX
    app.get ("/xrpc/com.atproto.sync.getRepo",                    this.syncGetRepo()); // XXX
    app.get ("/xrpc/com.atproto.sync.getCheckout",                this.syncGetCheckout()); // XXX
    app.get ("/xrpc/com.atproto.sync.getBlob",                    this.syncGetBlob()); // XXX
    app.post("/xrpc/com.atproto.repo.createRecord",       authz,  this.repoCreateRecord()); // XXX
    app.post("/xrpc/com.atproto.repo.putRecord",          authz,  this.repoCreateRecord()); // XXX // separate implementation should be easy
    app.post("/xrpc/com.atproto.repo.deleteRecord",       authz,  this.repoDeleteRecord()); // XXX
    app.get ("/xrpc/com.atproto.repo.getRecord",          authz,  this.repoGetRecord()); // XXX
    app.post("/xrpc/com.atproto.repo.uploadBlob",         authz,  this.repoUploadBlob()); // XXX
    Object.entries({
        'actor.searchActorsTypeahead':        'get',
        'graph.getLists':                     'get',
        'graph.getFollows':                   'get',
        'graph.getFollowers':                 'get',
        'graph.muteActor':                    'post',
        'graph.unmuteActor':                  'post',
        'actor.getProfile':                   'get',
        'feed.getTimeline':                   'get',
        'feed.getAuthorFeed':                 'get',
        'feed.getActorFeeds':                 'get',
        'notification.listNotifications':     'get',
        'notification.updateSeen':            'post',
        'unspecced.getPopularFeedGenerators': 'get',
        'feed.getFeedGenerator':              'get',
        'feed.getFeedGenerators':             'get',
        'feed.getPostThread':                 'get',
        'feed.getPosts':                      'get',
        'feed.getLikes':                      'get',
        'feed.getFeed':                       'get',
      })
      .forEach(([rpc, method]) => {
        const mware = [authz];
        if (method === 'post') mware.push(express.json());
        mware.push(async function (req, res) {
          const isPOST = (method === 'post');
          const q = (req.query && Object.keys(req.query).length) ? `?${new URLSearchParams(req.query).toString()}` : '';
          const url = new URL(`https://${conf.appViewDomain}/xrpc/app.bsky.${rpc}${q}`);
          const body = isPOST ? JSON.stringify(req.body) : undefined;
          const headers = {
            Authorization: `Bearer ${jwt.sign({
              iss: conf.didPLC,
              aud: `did:web:${conf.appViewDomain}`,
              exp: tomorrow(),
            }, conf.privateKeyBytes, { algorithm: 'ES256' })}`,
            'Content-Type': isPOST ? 'application/json' : undefined,
          };
          const result = await fetch(url.toString(), { method, body, headers });
          res.status(result.status).json(await result.json());
        });
        app[method](`/xrpc/app.bsky.${rpc}`, mware);
      })
    ;
    app.use(function (err, req, res, next) {
      if (err.name === "UnauthorizedError") return res.status(401).json({ err: 'Invalid token' });
      next(err);
    });
    this.app = app;
  }
  serverDescribeServer () {
    return (req, res) => res.json({ availableUserDomains: [] });
  }
  serverCreateSession () {
    return (req, res) => {
      if (req.body.identifier !== this.conf.handle || req.body.password !== this.conf.password) {
        return res.status(401).json({ err: 'Invalid identifier or password.' });
      }
      res.json({
        accessJwt: jwt.sign({
          scope: 'com.atproto.access',
          sub: this.conf.didPLC,
          iat: nowInSeconds(),
          exp: tomorrow(),
        }, this.conf.jwtSecret, { algorithm: 'HS256' }),
        refreshJwt: "todo", // XXX this is easily fixed
        handle: this.conf.handle,
        did: this.conf.didPLC,
      });
    };
  }
  serverGetSession () {
    return (req, res) => res.json({ handle: this.conf.handle, did: this.conf.didPLC, email: this.conf.email });
  }
}

/*
#TODO: require auth if we can't answer it ourselves
#@authenticated
async def identity_resolve_handle(request: web.Request):
	async with client.get(f"https://{APPVIEW_SERVER}/xrpc/com.atproto.identity.resolveHandle", params=request.query) as r:
		return web.json_response(await r.json(), status=r.status)

async def sync_subscribe_repos(request: web.Request):
	ws = web.WebSocketResponse()
	await ws.prepare(request)

	queue = asyncio.Queue()
	async with firehose_queues_lock:
		firehose_queues.add(queue)

	print("NEW FIREHOSE CLIENT", request.remote, request.headers.get("x-forwarded-for"), request.query)

	try:
		while True:
			await ws.send_bytes(await queue.get())
	except ConnectionResetError:
		await ws.close()
		return ws
	finally:
		async with firehose_queues_lock:
			firehose_queues.remove(queue)

async def sync_get_repo(request: web.Request):
	did = request.query["did"]
	assert(did == repo.did)
	return web.Response(body=repo.get_checkout(), content_type="application/vnd.ipld.car")

async def sync_get_checkout(request: web.Request):
	did = request.query["did"]
	assert(did == repo.did)
	commit = request.query.get("commit")
	if commit is not None:
		commit = CID.decode(commit)
	return web.Response(body=repo.get_checkout(commit), content_type="application/vnd.ipld.car")

async def sync_get_blob(request: web.Request):
	did = request.query["did"]
	assert(did == repo.did)
	cid = CID.decode(request.query["cid"])

	# XXX: deliberate and opinionated misinterpretation of atproto spec
	# We do not consider any single mime to be directly assocated with a blob
	mime = "application/octet-stream"

	return web.Response(body=repo.get_blob(cid), content_type=mime)


@authenticated
async def repo_create_record(request: web.Request):
	req = json_to_record(await request.json())
	assert(req["repo"] == DID_PLC)
	collection = req["collection"]
	rkey = req.get("rkey")
	record = req["record"]
	uri, cid, firehose_msg = repo.create_record(collection, record, rkey)
	await firehose_broadcast(firehose_msg)
	return web.json_response({
		"uri": uri,
		"cid": cid.encode("base32")
	})

@authenticated
async def repo_delete_record(request: web.Request):
	req = json_to_record(await request.json())
	assert(req["repo"] == DID_PLC)
	collection = req["collection"]
	rkey = req["rkey"]
	firehose_msg = repo.delete_record(collection, rkey)
	await firehose_broadcast(firehose_msg)
	return web.Response()

@authenticated
async def repo_get_record(request: web.Request):
	collection = request.query["collection"]
	repo_did = request.query["repo"]
	rkey = request.query["rkey"]
	if repo_did == repo.did:
		# TODO: return correct error on not found
		uri, cid, value = repo.get_record(collection, rkey)
		return web.json_response(record_to_json({
			"uri": uri,
			"cid": cid.encode("base32"),
			"value": dag_cbor.decode(value)
		}))
	else:
		async with client.get(f"https://{APPVIEW_SERVER}/xrpc/com.atproto.repo.getRecord", params=request.query, headers=get_appview_auth()) as r:
			return web.json_response(await r.json(), status=r.status)

@authenticated
async def repo_upload_blob(request: web.Request):
	mime = request.headers["content-type"]
	blob = await request.read() # XXX: TODO: ensure maximum blob size!!! (we could get OOMed by big blobs here)
	ref = repo.put_blob(blob)

	# XXX: deliberate and opinionated misinterpretation of atproto spec
	# We will never sniff mimes, and reflect back whatever the client claimed it to be.
	# Thus, the same blob bytes can be referenced with multiple mimes
	ref["mimeType"] = mime  # I can be whatever you want me to be

	return web.json_response(record_to_json({"blob": ref}))


*/

function nowInSeconds () {
  return Math.floor(Date.now() / 1000);
}

function tomorrow () {
  return nowInSeconds() + (60 * 60 * 24);
}
