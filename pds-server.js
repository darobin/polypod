#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { cwd, env } from 'node:process';
import { program } from 'commander';
import PDS from './lib/pds.js';
import makeRel from './lib/rel.js';

const rel = makeRel(import.meta.url);
const { version } = JSON.parse(await readFile(rel('package.json')));

program
  .name('polypod')
  .description('An experimental PDS')
  .version(version)
  .requiredOption('--store-dir <path>', 'a directory to store the PDS data in')
;
program.parse();
let { storeDir } = program.opts();
storeDir = isAbsolute(storeDir) ? storeDir : join(cwd(), storeDir);

(async () => {
  const pds = await PDS.create({
    storeDir,
    adminPassword: env.POLYPOD_ADMIN_PASSWORD,
  });
  await pds.start();
})();
