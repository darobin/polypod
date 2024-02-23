#!/usr/bin/env node
import { argv, cwd, exit } from "node:process";
import { homedir } from "node:os";
import { mkdir } from "node:fs/promises";
import { join, isAbsolute, dirname } from "node:path";
import { program } from 'commander';
import makeRel from './lib/rel.js';
import loadJSON from './lib/load-json.js';
import saveJSON from './lib/save-json.js';

const rel = makeRel(import.meta.url);
const { version } = await loadJSON(rel('./package.json'));

// XXX use this as list of values and also to validate
// actually move this to a lib for reuse
const validConfig = {
  jwtSecret: () => true,
  didPLC: () => true,
  appViewDomain: () => true,
  privateKeyPath: () => true,
  handle: () => true,
  password: () => true,
  email: () => true,
};

program
  .name('polypod')
  .description('Experimental PDS')
  .version(version)
  .option('-c, --config <configFile>', 'path to a configuration file to use')
;

// --- Configuration
const configCmd = program.command('config');
configCmd
  .command('create')
  .description('create a configuration file')
  .action(async () => {
    // resolve config path, either the option or the default
    // generate defaults (options to override?)
    // save
    console.warn(`CREATE`);
  })
;
configCmd
  .command('set')
  .description('set a configuration value')
  .argument('<key>', 'the configuration key')
  .argument('<value>', 'the configuration value')
  .action(async (key, value, opt) => {
    // resolve config path, either the option or the default
    // load the config
    // set the value
    // save
    console.warn(`SET ${key}=${value} (${JSON.stringify(opt)}) (${JSON.stringify(program.opts())})`);
  })
;
configCmd
  .command('get')
  .description('get a configuration value')
  .argument('<key>', 'the configuration key')
  .action(async (key, opt) => {
    // resolve config path, either the option or the default
    // load the config
    // get the value and output the value
    console.warn(`GET ${key} (${JSON.stringify(opt)}) (${JSON.stringify(program.opts())})`);
  })
;
configCmd
  .action(async (opt) => {
    // resolve config path, either the option or the default
    // load the config
    // print it all out, human readable
    console.warn(`ALL THE VALUES  (${JSON.stringify(opt)}) (${JSON.stringify(program.opts())})`);
  })
;

program.parse(argv);

function resolveConfigPath () {
  const { config } = program.opts();
  if (config) return isAbsolute(config) ? config : join(cwd(), config);
  return join(homedir(), '.polypod/config.json');
}

function hadSetConfigPath () {
  return !!program.opts().config;
}

async function loadConfig () {
  const pth = resolveConfigPath();
  try {
    return await loadJSON(pth);
  }
  catch (err) {
    if (hadSetConfigPath()) die(`Can't load "${pth}", did you run 'polypod -c "${pth}" config create'?`);
    die(`Can't load default configuration, did you run 'polypod config create'?`);
  }
}

async function saveConfig (data) {
  const pth = resolveConfigPath();
  const dir = dirname(pth);
  await mkdir(dir, { recursive: true });
  return await saveJSON(pth, data);
}

function die (msg) {
  console.error(msg);
  exit(1);
}
