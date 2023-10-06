
import PDS from './lib/pds.js';
import makeRel from './lib/rel.js';

const rel = makeRel(import.meta.url);

(async () => {
  const pds = await PDS.create({
    storeDir: rel('./scratch/'),
  });
  await pds.start();
})();
