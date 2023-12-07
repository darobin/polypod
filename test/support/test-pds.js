
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import AtpAgent from '@atproto/api';
import { nanoid } from 'nanoid';
import getPort from 'get-port';
import * as ui8 from 'uint8arrays';
import PDS from '../../lib/pds.js';

export const adminPassword = nanoid();
export const pdsPort = await getPort();
export const serverURL = `http://localhost:${pdsPort}/`;
export const agent = new AtpAgent({ service: serverURL });

export async function createPDS () {
  const storeDir = await mkdtemp(join(tmpdir(), 'polypod-test-'));
  const pds = await PDS.create({
    storeDir,
    adminPassword,
    port: pdsPort,
  });
  await pds.start();
}

export async function killPDS (pds) {
  await pds.destroy();
}

export function basicAuth (username, password) {
  return (
    'Basic ' +
    ui8.toString(ui8.fromString(`${username}:${password}`, 'utf8'), 'base64pad')
  );
}

export function adminAuth () {
  return basicAuth('admin', adminPassword);
}
