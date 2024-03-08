
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Secp256k1Keypair } from '@atproto/crypto';
import { createOp, Client } from '@did-plc/lib';
import { normalizeAndEnsureValidHandle, isValidTld } from '@atproto/syntax';
import KeyEncoder from 'key-encoder';
import { toString } from 'uint8arrays';

async function createKeyPair () {
  return await Secp256k1Keypair.create({ exportable: true });
}

async function createUserDirectory (path) {
  await mkdir(path, { recursive: true });
  const files = await readdir(path);
  if (files.length) throw new Error(`Directory "${path}" is not empty.`);
}

export async function createUser ({ handle, directory, pdsServer }, conf) {
  // Handle
  handle = normalizeAndEnsureValidHandle(handle);
  if (!isValidTld(handle)) throw new Error(`Handle uses invalid TLD.`);

  // Directory
  await createUserDirectory(directory);

  // Private key
  const kp = await createKeyPair({ exportable: true });
  const encoder = new KeyEncoder.default('secp256k1'); // welcome to JS!
  const privKey = encoder.encodePrivate(toString(await kp.export(), 'hex'), 'raw', 'pem');
  const privKeyPath = join(directory, 'private.key');
  await writeFile(privKeyPath, privKey);

  // Genesis
  const { op, did } = await createOp({
    signingKey: kp.did(),
    rotationKeys: [kp.did()], // XXX this needs to be better
    handle,
    pds: pdsServer,
    signer: kp, // XXX
  });
  await writeFile(join(directory, 'genesis-plc.json'), JSON.stringify(op, null, 2));
  await writeFile(join(directory, 'did.json'), JSON.stringify({ did }, null, 2));
  
  // Publish
  console.warn(conf.didPLC);
  const plcClient = new Client(conf.didPLC.replace(/\/+$/, ''));
  await plcClient.sendOperation(did, op);

  return {
    did,
    privKeyPath,
  };
}
