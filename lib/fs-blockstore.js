
import { join, dirname } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { CID } from 'multiformats';
import { sync as initBlake3 } from 'blake3-multihash';

export const CODEC_DAG_JSON = 0x0129;
export const CODEC_DAG_CBOR = 0x71;
export const CODEC_DAG_PB = 0x70;
export const CODEC_RAW = 0x55;

// This implements BlockStore as described in
// https://github.com/wnfs-wg/rs-wnfs/blob/main/wnfs-common/src/blockstore.rs
// It is a simple store that just puts things on disk.
export default class FSBlockStore {
  constructor (root) {
    console.warn(`new FSBlockStore ${root}`);
    if (!root) throw new Error('FSBlockStore needs a root directory.');
    this.root = root;
    this.blake3Hasher = null;
  }

  // bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
  async createCID (bytes, codec) {
    if (!this.blake3Hasher) {
      this.blake3Hasher = await initBlake3();
    }
    const digest = this.blake3Hasher.digest(bytes);
    return CID.create(1, codec || CODEC_DAG_CBOR, digest);
  }

  pathForCID (cid) {
    const [, pfx, rst] = cid.toString().match(/(.{8})(.+)/);
    return join(this.root, pfx, rst);
  }

  async getBlock (cid) {
    console.warn(`getBlock`, cid);
    if (typeof cid === 'string') cid = CID.parse(cid);
    return readFile(this.pathForCID(cid));
  }
  async putBlock (bytes, codec) {
    console.warn(`putBlock ${codec}`);
    const cid = await this.createCID(bytes, codec);
    const fn = this.pathForCID(cid);
    await mkdir(dirname(fn), { recursive: true });
    await writeFile(fn, bytes);
    return cid;
  }
}
