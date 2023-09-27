/*eslint no-redeclare: 0*/

import Store from '../lib/store.js';

const s = Store.createEmpty('/Users/robin/Code/darobin/polypod-wnfs/scratch/cid-store');
await s.mkdir(['robin', 'notes']);
await s.save(['robin', 'notes', 'poem.txt'], 'time will say nothing but I told you so');
console.warn(`Done!`);
