
import { TextEncoder } from 'node:util';
import { PublicDirectory } from 'wnfs';
import { CID } from 'multiformats';
import FSBlockStore, { CODEC_RAW } from './fs-blockstore.js';

// This is based off of https://github.com/oddsdk/ts-odd/blob/main/src/fs/v3/PublicRootWasm.ts
// Different implementation because we're not in the browser and can take some shortcuts.

export default class Store {
  constructor ({ root, store }) {
    this.root = Promise.resolve(root);
    this.lastRoot = root;
    this.store = store;
  }
  static createEmpty (storePath, date = new Date()) {
    return new Store({
      root: new PublicDirectory(date),
      store: new FSBlockStore(storePath),
    });
  }
  static createFromCID (storePath, cid) {
    if (typeof cid === 'string') cid = CID.parse(cid);
    const store = new FSBlockStore(storePath);
    return new Store({
      root: PublicDirectory.load(cid.bytes, store),
      store,
    });
  }

  async atomically (fn) {
    const root = await this.root;
    this.root = fn(root);
    return await this.root;
  }

  async withError (operation, opDescription) {
    try {
      return await operation;
    }
    catch (e) {
      console.error(`Error during WASM operation ${opDescription}:`);
      throw e;
    }
  }

  async mkdir (path) {
    if (typeof path === 'string') path = parsePath(path);
    await this.atomically(async root => {
      const { rootDir } = await this.withError(
        root.mkdir(path, new Date(), this.store),
        `mkdir(${path.join("/")})`
      );
      return rootDir;
    });
    return this;
  }

  async writeFile (path, content) {
    if (typeof path === 'string') path = parsePath(path);
    if (typeof content === 'string') content = txt2bytes(content);
    // we don't chunk so we can just use putBlock for any content
    const cidBytes = await this.store.putBlock(content, CODEC_RAW);
    await this.atomically(async root => {
      const { rootDir } = await this.withError(
        root.write(path, cidBytes, new Date(), this.store),
        `write(${path.join("/")})`
      );
      return rootDir;
    })
    return this;
  }

  async readFile (path, encoding) {
    const root = await this.root;
    if (typeof path === 'string') path = parsePath(path);

    const cidBytes = await this.withError(
      root.read(path, this.store),
      `read(${path.join("/")})`
    );
    const cid = CID.decode(cidBytes);
    const buf = await this.store.getBlock(cid);
    if (encoding) return buf.toString(encoding);
    return buf;
  }

  async readFileMetadata (path) {
    const root = await this.root;
    if (typeof path === 'string') path = parsePath(path);
    try {
      let n = await root.getNode(path, this.store);
      if (!n) return undefined;
      if (n.isFile()) n = n.asFile();
      else n = n.asDir();
      const meta = n.metadata();
      return meta;
    }
    catch {
      return undefined;
    }
  }

  async ls (path) {
    const root = await this.root;
    if (typeof path === 'string') path = parsePath(path);

    const node = await this.withError(
      root.getNode(path, this.store),
      `ls(${path.join("/")})`
    );

    if (!node) throw new Error(`Can't ls ${path.join("/")}: No such directory`);
    if (!node.isDir()) throw new Error(`Can't ls ${path.join("/")}: Not a directory`);

    const dir = node.asDir();
    const entries = await this.withError(
      root.ls(path, this.store),
      `ls(${path.join("/")})`
    );

    const ret = [];
    for (const entry of entries) {
      const node = await dir.lookupNode(entry.name, this.store);
      const cid = node.isFile()
        ? CID.decode(await node.asFile().store(this.store))
        : CID.decode(await node.asDir().store(this.store))
      ;
      ret.push({
        cid,
        name: entry.name,
        path: `/${path.join('/')}/${entry.name}`,
        isFile: () => node.isFile(),
        isDirectory: () => node.isDir(),
      });
    }
    return ret.sort((a, b) => a.name.localeCompare(b.name));
  }

  async rm (path) {
    if (typeof path === 'string') path = parsePath(path);
    await this.atomically(async root => {
      const { rootDir } = await this.withError(
        root.rm(path, this.store),
        `rm(${path.join("/")})`
      );
      return rootDir;
    });
    return this;
  }

  async mv (from, to) {
    if (typeof from === 'string') from = parsePath(from);
    if (typeof to === 'string') to = parsePath(to);
    await this.atomically(async root => {
      const { rootDir } = await this.withError(
        root.basicMv(from, to, new Date(), this.store),
        `basicMv(${from.join("/")}, ${to.join("/")})`
      );
      return rootDir;
    });
    return this;
  }

  async exists (path) {
    const root = await this.root;
    if (typeof path === 'string') path = parsePath(path);
    try {
      const n = await root.getNode(path, this.store);
      return !!n;
    }
    catch {
      return false;
    }
  }

  async commit () {
    let cid;
    await this.atomically(async root => {
      const cidBytes = await root.store(this.store);
      this.lastRoot = root;
      cid = CID.decode(cidBytes);
      return root;
    });
    return cid;
  }
}

function parsePath (path) {
  return path.split('/').filter(Boolean);
}

function txt2bytes (str) {
  return new TextEncoder().encode(str);
}
