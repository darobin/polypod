
import { nanoid } from "nanoid"

// A very simple DID scheme that's not at all decentralised. We mint it by storing locally
// and keeping the keys and all.
export default class DID {
  constructor (data) {
    this.data = data;
  }
  async create () {
    const id = nanoid();
    // XXX
    // - make a DID document, we probably need to store the handle, keys, stuff — match did:plc
    // - store in DB
    const doc = {};
    await this.data.dids.set(id, doc);
    return `did:polypod:${id}`;
  }
}
