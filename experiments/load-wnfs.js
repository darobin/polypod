/*eslint no-redeclare: 0*/

import { readFile } from 'node:fs/promises';
import Store from '../lib/store.js';

const s = Store.createFromCID(
  '/Users/robin/Code/darobin/polypod-wnfs/scratch/cid-store',
  'bafyr4iffwyego5hajoez6shkypiui477f3hnciff67lgms5xbkufrwrrpq' // the CID from trying-wnfs
);
await s.mkdir(['robin', 'pics']);
const wtf = await readFile('/Users/robin/Code/darobin/polypod-wnfs/scratch/wtf.jpg');
await s.writeFile(['robin', 'pics', 'wtf.jpg'], wtf);
const cid = await s.commit();
console.warn(`Done again: ${cid.toString()}!`);
// console.warn(`Done!`);

// results in bafyr4igsesjcxeympsapi25hnw5pugoryiqokxjryhmz7plihtuwtespn4
