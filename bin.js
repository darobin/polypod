#!/usr/bin/env node
import { argv, cwd, exit } from "node:process";
import { homedir } from "node:os";
import { mkdir } from "node:fs/promises";
import { join, isAbsolute, dirname } from "node:path";
import { program } from 'commander';
import makeRel from './lib/rel.js';
import loadJSON from './lib/load-json.js';
import saveJSON from './lib/save-json.js';
import { configurationKeys, findErrorsInKey, defaultConfiguration } from "./lib/config.js";
import { createUser } from "./lib/identity.js";

const rel = makeRel(import.meta.url);
const { version } = await loadJSON(rel('./package.json'));

program
  .name('polypod')
  .description('Experimental PDS')
  .version(version)
  .option('-c, --config <configFile>', 'path to a configuration file to use')
;

// --- Configuration
const configCmd = program.command('config');
configCmd
  .command('set')
  .description('set a configuration value')
  .argument('<key>', 'the configuration key')
  .argument('<value>', 'the configuration value')
  .action(async (key, value, opt) => {
    const c = await loadConfig();
    const errors = findErrorsInKey(key, value);
    if (errors) reportErrors(`Cannot set configuration value`, errors);
    c[key] = value;
    await saveConfig(c);
    console.warn(`SET ${key}=${value} (${JSON.stringify(opt)}) (${JSON.stringify(program.opts())})`);
  })
;
configCmd
  .command('get')
  .description('get a configuration value')
  .argument('<key>', 'the configuration key')
  .action(async (key) => {
    if (!configurationKeys.has(key)) die(`Unknown configuration key "${key}".`);
    const c = await loadConfig();
    console.log(`${key} = ${c[key]}`);
  })
;
configCmd
  .action(async (opt) => {
    const c = await loadConfig();
    [...configurationKeys].sort((a, b) => a.localeCompare(b)).forEach(k => {
      console.log(`• ${k} = ${c[k]}`);
    });
    console.warn(`ALL THE VALUES  (${JSON.stringify(opt)}) (${JSON.stringify(program.opts())})`);
  })
;

// --- Identity
program
  .command('create')
  .description('create an identity')
  .argument('<path>', 'the directory to store the identity in (gets created, has to be empty)')
  .argument('<handle>', 'the ATProto handle')
  .argument('<pds>', 'the PDS server URL')
  .action(async (path, handle, pdsServer) => {
    const directory = absPath(path);
    const conf = defaultConfiguration();
    const { did, privKeyPath } = await createUser({ handle, directory, pdsServer }, conf);
    const configPath = join(directory, 'config.json');
    await saveConfig(conf, configPath);
    console.log(`Identity created in "${directory}"`);
    console.log(`  • DID "${did}"`);
    console.log(`  • key "${configPath}"`);
    console.log(`  • configuration "${configPath}"`);
  })
;

program.parse(argv);

function absPath (pth) {
  return isAbsolute(pth) ? pth : join(cwd(), pth);
}

function resolveConfigPath () {
  const { config } = program.opts();
  if (config) return absPath(config);
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
    // NOTE: for the time being there is no polypod config create because it's single-user so users and
    // config are conflated. That will change, though.
    if (hadSetConfigPath()) die(`Can't load "${pth}", did you run 'polypod -c "${pth}" config create'?`);
    die(`Can't load default configuration, did you run 'polypod config create'?`);
  }
}

async function saveConfig (data, path) {
  const pth = path || resolveConfigPath();
  const dir = dirname(pth);
  await mkdir(dir, { recursive: true });
  return await saveJSON(pth, data);
}

function reportErrors (msg, errors) {
  die(`${msg}:\n${errors.map(e => `  • ${e}`).join('\n')}`);
}
function die (msg) {
  console.error(msg);
  exit(1);
}
