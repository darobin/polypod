
import { match } from 'node:assert';
import { createPDS, killPDS, agent, adminAuth } from './support/test-pds.js';

before(async () => await createPDS());
after(async () => await killPDS());

describe('com.atproto.server.createInviteCode', async () => {
  it('creates a valid code', async () => {
    const code = await createInviteCode(1, 'did:test:1');
    console.warn(`code=${code}`);
    match(code, /^polypod-.+/);
  });
});

async function createInviteCode (useCount, forAccount) {
  const res = await agent.api.com.atproto.server.createInviteCode(
    { useCount, forAccount },
    {
      headers: { authorization: adminAuth() },
      encoding: 'application/json',
    },
  );
  return res.data.code;
}
