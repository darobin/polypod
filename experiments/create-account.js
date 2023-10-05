
import API from '@atproto/api';
import { pdsURL, accounts } from './data.js';

const { BskyAgent } = API;
const agent = new BskyAgent({ service: pdsURL });

// create a new account on the server
await agent.createAccount({
  ...accounts.kitsune,
  inviteCode: 'some-code-12345-abcde',
});

console.warn(`ok…`);
