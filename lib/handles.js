
import { normalizeAndEnsureValidHandle, isValidTld, InvalidHandleError } from '@atproto/syntax';
import { HandleResolver } from '@atproto/identity';
import { InvalidRequestError } from '@atproto/xrpc-server';

const handleResolver = new HandleResolver({});

// We do a fair bit less than the original, for our more experimental use case. Notably,
// slur stuff isn't done since that's for real instances, and we leave DID resolution to the
// caller.
export function validateHandle (handle) {
  try {
    handle = normalizeAndEnsureValidHandle(handle);
  }
  catch (err) {
    if (err instanceof InvalidHandleError) throw new InvalidRequestError(err.message, 'InvalidHandle');
    throw err;
  }
  if (!isValidTld(handle)) throw new InvalidRequestError('Handle TLD is invalid or disallowed', 'InvalidHandle');
  return handle;
}

export async function resolveHandle (handle, pds) {
  if (pds && /^did:polypod:/.test(handle)) return await pds.ctx.data.people.resolveHandle(handle);
  const did = await handleResolver.resolve(handle);
  if (!did) throw new InvalidRequestError('Handle does not resolve', 'InvalidHandle');
  return did;
}
