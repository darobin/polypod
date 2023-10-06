
import API from '@atproto/api';
import { getInvite } from './shared.js';
import { pdsURL, accounts } from './data.js';

const { BskyAgent } = API;
const agent = new BskyAgent({ service: pdsURL });

const inviteCode = await getInvite();

// create a new account on the server
await agent.createAccount({
  ...accounts.kitsune,
  inviteCode,
});

console.warn(`ok…`);
