
import { nanoid } from 'nanoid';
import { Secp256k1Keypair } from '@atproto/crypto'

export default class DIDData {
  constructor (db) {
    this.db = db;
  }
  createDID () {
    return `did:polypod:${nanoid()}`;
  }
  async createDIDDocument (did, handle, pdsURL) {
    // If we have no DID, we create one from scratch and store the key.
    // The way we handle custodial key management is pretty naive.
    // Don't do this in production.
    if (!did) {
      const signingKey = await Secp256k1Keypair.create({ exportable: true });
      // XXX the rest
    }
    const doc = {
      '@context': [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/multikey/v1",
        "https://w3id.org/security/suites/secp256k1-2019/v1",
      ],
      id: did,
      createdAt: new Date().toISOString(),
    };
    if (handle) doc.alsoKnownAs= [`at://${handle}`];
    if (pdsURL) {
      doc.service = [
        {
          id: "#atproto_pds",
          type: "AtprotoPersonalDataServer",
          serviceEndpoint: pdsURL, // e.g. https://porcini.us-east.host.bsky.network
        }
      ];
    }
    await this.db.ref(`dids/${did}`).set(doc);
    return doc;
  }
  async resolveDID (did) {
    const snap = await this.db.ref(`dids/${did}`).get();
    if (snap.exists()) return snap.val();
    return null;
  }
}

// const serviceKeypair = await Secp256k1Keypair.create()
// serviceKeypair.did()
// publicKeyMultibase: ctx.signingKey.did().replace('did:key:', ''),
// {
  // "@context": [
  //   "https://www.w3.org/ns/did/v1",
  //   "https://w3id.org/security/multikey/v1",
  //   "https://w3id.org/security/suites/secp256k1-2019/v1"
  // ],
//   "id": "did:plc:izttpdp3l6vss5crelt5kcux",
//   "alsoKnownAs": [
//     "at://robin.berjon.com"
//   ],
//   "verificationMethod": [
//     {
//       "id": "did:plc:izttpdp3l6vss5crelt5kcux#atproto",
//       "type": "Multikey",
//       "controller": "did:plc:izttpdp3l6vss5crelt5kcux",
//       "publicKeyMultibase": "zQ3shP57qd9nqZ1Ffbb8Tm1BUTrU1cwDsH6jE4dzfsqxEQo1T"
//     }
//   ],
  // "service": [
  //   {
  //     "id": "#atproto_pds",
  //     "type": "AtprotoPersonalDataServer",
  //     "serviceEndpoint": "https://porcini.us-east.host.bsky.network"
  //   }
  // ]
// }
