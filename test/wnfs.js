
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import Store from '../lib/store.js';

let storeDir;
before(async () => {
  storeDir = await mkdtemp(join(tmpdir(), 'polypod-wnfs-'));
});

describe('WNFS', async () => {

});

// const s = Store.createEmpty('/Users/robin/Code/darobin/polypod-wnfs/scratch/cid-store');
// await s.mkdir(['robin', 'notes']);
// await s.save(['robin', 'notes', 'poem.txt'], 'time will say nothing but I told you so');
// const cid = await s.put();
// console.warn(`Done: ${cid.toString()}!`);
