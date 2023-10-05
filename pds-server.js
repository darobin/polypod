
import PDS from './lib/pds.js';


(async () => {
  const pds = await PDS.create({
    storeDir: './scratch/',
  });
  await pds.start();
})();
