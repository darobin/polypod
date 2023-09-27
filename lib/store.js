
import { PublicDirectory } from 'wnfs';
import { TextEncoder } from 'node:util';
import FSBlockStore, { CODEC_RAW } from './fs-blockstore.js';

// This is based off of https://github.com/oddsdk/ts-odd/blob/main/src/fs/v3/PublicRootWasm.ts
// Different implementation because we're not in the browser and can take some shortcuts.

// XXX
// I believe that we don't need to init WNFS with dynamic WASM loading.

export default class Store {
  constructor ({ root, store }) {
    this.root = Promise.resolve(root);
    this.store = store;
  }
  static createEmpty (storePath) {
    return new Store({
      root: new PublicDirectory(new Date()),
      store: new FSBlockStore(storePath),
    });
  }
  static createFromCID (storePath, cid) {
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

  async save (path, content) {
    if (typeof path === 'string') path = parsePath(path);
    if (typeof content === 'string') content = txt2bytes(content);
    // we don't chunk so we can just use putBlock for any content
    const cid = await this.store.putBlock(content, CODEC_RAW);
    await this.atomically(async root => {
      const { rootDir } = await this.withError(
        root.write(path, cid.bytes, new Date(), this.store),
        `write(${path.join("/")})`
      );
      return rootDir;
    })
    return this;
  }
}

function parsePath (path) {
  path.split('/').filter(Boolean);
}

function txt2bytes (str) {
  return new TextEncoder().encode(str);
}
