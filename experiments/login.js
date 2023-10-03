
import { BskyAgent } from '@atproto/api';
import { pdsURL, accounts } from './data.js';

const agent = new BskyAgent({ service: pdsURL });

await agent.login({ identifier: accounts.kitsune.email, password: accounts.kitsune.password });
console.warn(`I'm in.`);
