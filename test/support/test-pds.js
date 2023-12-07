
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { nanoid } from 'nanoid';
import PDS from '../../lib/pds.js';

export const adminPassword = nanoid();

export async function createPDS () {
  const storeDir = await mkdtemp(join(tmpdir(), 'polypod-test-'));
  const pds = await PDS.create({
    storeDir,
    adminPassword,
  });
  await pds.start();
}

export async function killPDS (pds) {
  await pds.destroy();
}
