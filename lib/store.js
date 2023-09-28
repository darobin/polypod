
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
  static createEmpty (storePath) {
    return new Store({
      root: new PublicDirectory(new Date()),
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

  async commit () {
    return await this.atomically(async root => {
      const cidBytes = await root.store(this.store);
      this.lastRoot = root;
      return CID.decode(cidBytes);
    });
  }
}

function parsePath (path) {
  path.split('/').filter(Boolean);
}

function txt2bytes (str) {
  return new TextEncoder().encode(str);
}
