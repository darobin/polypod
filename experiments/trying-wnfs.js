/*eslint no-redeclare: 0*/

import Store from '../lib/store.js';

const s = Store.createEmpty('/Users/robin/Code/darobin/polypod-wnfs/scratch/cid-store');
await s.mkdir(['robin', 'notes']);
await s.writeFile(['robin', 'notes', 'poem.txt'], 'time will say nothing but I told you so');
const cid = await s.commit();
console.warn(`Done: ${cid.toString()}!`);
