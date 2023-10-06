
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import makeRel from './rel.js';

const rel = makeRel(import.meta.url);
const baseDir = rel('../vendor/atproto/lexicons');

const lexicons = {};
export default lexicons;

[
  'com.atproto.server.createAccount',
  'com.atproto.server.createInviteCode',
]
  .forEach(nsid => {
    const parts = nsid.split('.');
    const method = parts.pop();
    let obj = lexicons;
    parts.forEach(p => {
      if (!obj[p]) obj[p] = {};
      obj = obj[p];
    });
    obj[method] = JSON.parse(readFileSync(join(baseDir, ...parts, `${method}.json`)));
  })
;
