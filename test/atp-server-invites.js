
import { equal, ok } from 'node:assert';
import { createPDS, killPDS } from './support/test-pds.js';

before(async () => await createPDS());
after(async () => await killPDS());
