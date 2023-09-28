
import { join, dirname } from 'node:path';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { equal, ok } from 'node:assert';
import Store from '../lib/store.js';

const poem = 'time will say nothing but I told you so';
let storeDir;

before(async () => {
  storeDir = await mkdtemp(join(tmpdir(), 'polypod-wnfs-'));
});

describe('WNFS', async () => {
  it('can write a simple file', async () => {
    const s = Store.createEmpty(storeDir);
    await s.mkdir(['robin', 'notes']);
    await s.writeFile('/robin/notes/poem.txt', poem);
    await s.commit();
    const cnt = await readFile(join(storeDir, 'bafkr4ia/gsmbphhyzkjhkd3ufr462y6eufalfhqgj4whonw2kw5av3waote'), 'utf-8');
    equal(cnt, poem, 'the poem came out right');
  });
  it('can test existence', async () => {
    const fn = '/test/existence/poem.txt';
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dirname(fn));
    await s.writeFile(fn, poem);
    await s.commit();
    ok(await s.exists(fn), 'file exists');
    ok(!await s.exists(fn + '.md'), 'non existent file does not exist');
  });
});
