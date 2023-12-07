
import { join, dirname } from 'node:path';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { equal, ok } from 'node:assert';
import Store from '../lib/store.js';

const poem = 'time will say nothing but I told you so';
let storeDir;

before.skip(async () => {
  storeDir = await mkdtemp(join(tmpdir(), 'polypod-wnfs-'));
});

describe.skip('WNFS', async () => {
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
  it('can read files', async () => {
    const fn = '/test/reading/poem.txt';
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dirname(fn));
    await s.writeFile(fn, poem);
    await s.commit();
    equal(await s.readFile(fn, 'utf-8'), poem, 'the poem came out right');
  });
  it('can delete files', async () => {
    const fn = '/test/rm/poem.txt';
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dirname(fn));
    await s.writeFile(fn, poem);
    await s.commit();
    ok(await s.exists(fn), 'file exists');
    await s.rm(fn);
    await s.commit();
    ok(!await s.exists(fn), 'file no longer exists');
  });
  it('can move files', async () => {
    const fn = '/test/mv/poem.txt';
    const fn2 = fn.replace('poem', 'villanelle');
    const dir1 = fn.replace('/poem.txt', '');
    const dir2 = dir1.replace('mv', 'other');
    const fn3 = fn2.replace('mv', 'other');
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dirname(fn));
    await s.writeFile(fn, poem);
    await s.commit();
    ok(await s.exists(fn), 'file exists');
    await s.mv(fn, fn2);
    await s.commit();
    ok(!await s.exists(fn), 'file 1 no longer exists');
    ok(await s.exists(fn2), 'file 2 exists');
    await s.mv(dir1, dir2);
    await s.commit();
    ok(!await s.exists(dir1), 'dir 1 no longer exists');
    ok(!await s.exists(fn2), 'file 2 no longer exists (dir moved)');
    ok(await s.exists(dir2), 'dir 2 exists');
    ok(await s.exists(fn3), 'file 3 exists (dir moved)');
  });
  it('can list files', async () => {
    const dir = '/test/ls';
    const files = ['one', 'two', 'three', 'four'];
    const dirs = ['aaa', 'ggg', 'zzz'];
    const all = [].concat(files).concat(dirs).sort();
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dir);
    await Promise.all(files.map(n => s.writeFile(join(dir, n), poem)));
    await Promise.all(dirs.map(n => s.mkdir(join(dir, n))));
    for (const d of dirs) {
      await s.mkdir(join(dir, d));
    }
    await s.commit();
    const list = await s.ls(dir);
    equal(list.length, 7, 'all entries listed');
    list.forEach(({ name }, idx) => equal(name, all[idx], `entry ${idx} is correct`));
    const lsFile = list[1]; // four
    const lsDir = list[0]; // aaa
    ok(lsFile.isFile(), 'files are files');
    ok(!lsFile.isDirectory(), 'files are not directories');
    ok(lsDir.isDirectory(), 'directories are directories');
    ok(!lsDir.isFile(), 'directories are not files');
  });
  it('supports file metdata', async () => {
    const fn = '/test/meta/poem.txt';
    const date = new Date();
    // this gets the right kind of integer to match how wnfs does seconds
    const timestamp = Math.floor((date.getTime() / 1000)).toString();
    const s = Store.createEmpty(storeDir);
    await s.mkdir(dirname(fn));
    await s.writeFile(fn, poem);
    await s.commit();
    const meta = await s.readFileMetadata(fn);
    equal(`${meta.created}`, timestamp, `created correct`);
    equal(`${meta.modified}`, timestamp, `modified correct`);
  });
});
