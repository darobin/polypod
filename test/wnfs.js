
import { join } from 'node:path';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { equal } from 'node:assert';
import Store from '../lib/store.js';

let storeDir;
before(async () => {
  storeDir = await mkdtemp(join(tmpdir(), 'polypod-wnfs-'));
});

describe('WNFS', async () => {
  it('can write a simple file', async () => {
    const poem = 'time will say nothing but I told you so';
    const s = Store.createEmpty(storeDir);
    await s.mkdir(['robin', 'notes']);
    await s.writeFile('/robin/notes/poem.txt', poem);
    await s.commit();
    const cnt = await readFile(join(storeDir, 'bafkr4ia/gsmbphhyzkjhkd3ufr462y6eufalfhqgj4whonw2kw5av3waote'), 'utf-8');
    equal(cnt, poem, 'the poem came out right');
  });
});

// const s = Store.createEmpty('/Users/robin/Code/darobin/polypod-wnfs/scratch/cid-store');
// await s.mkdir(['robin', 'notes']);
// await s.writeFile(['robin', 'notes', 'poem.txt'], 'time will say nothing but I told you so');
// const cid = await s.commit();
// console.warn(`Done: ${cid.toString()}!`);
