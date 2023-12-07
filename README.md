
# polypod

**THIS IS EXPERIMENTAL. DO NOT EXPECT ANYTHING TO WORK, OR EVEN MAKE SENSE.**

The thesis is that we need a system that:

- Is a *user agent* but can do more than a browser, notably be connected persistently and
  carry out smarter automation.
- Supports *polylegal* governance, which is to say that it can create governed systems that
  are shared with others, declare various rules that it abides by in given contexts, and
  enforce where needed. (The polylaw concept is taken from [the work of Ada Palmer](https://en.wikipedia.org/wiki/Too_Like_the_Lightning)
  but existed in earlier times.)
- Is LoFi (local first) or friendly to LoFi principles and can sync itself to various places 
  (e.g. be partly on your phone, have different identities in different places, all kinds of 
  confidentiality levels).
- Supports "big world" integrations (e.g. having the content you publish indexed globally
  so that others can easily find it) but only under the control of those who contribute
  content.
- Might go so far as to eliminate the notion of server, replacing it with pods communicating
  with each other.
- Supports credible exit.
- Supports easy extensibilty via new protocols in a coherent way.

My current approach is to build an ATProto PDS that is optimised for ease of experimentation.
The theory is that an ATProto PDS + extensible WASM for protocols + built-in support for
Web Tiles + a no-codeish way for people to build their own local IFTTT would be pretty sweet.
On top of that, an IPFS pinning service (gated by auth) would be wonderful: it would open up
all the projects for which the first question is "where do I store stuff?"

NOTE: There's quite a fair bit of stuff in here lifted more or less straight from bluesky-social/atproto,
notably from @atproto/pds. I would simply reuse but that code is set up to prevent importing (I presume
so that people don't start depending on its internals).

## Running This Thing

**I repeat**: this is an implementation that is optimised for experimentation. It is experimental.
It is an experiment. If you run it in production or with any expectation of safety or sanity,
you will get hurt. It would be stupid, and on you.

```
npm install
POLYPOD_ADMIN_PASSWORD=hunter2 ./pds-server.js --store-dir /some/directory/it/can/clobber
```

## Some Resources

- [ATProtocol](https://atproto.com/)
- [IPFS](https://ipfs.tech/) and [Iroh](https://iroh.computer/)
- [Minecraft server governance](https://www.semanticscholar.org/search?q=%5C%22Seth%20Frey%5C%22&sort=relevance)
- [WNFS](https://github.com/wnfs-wg/)
- [CRDTs](https://yjs.dev/)
- [UCANs](https://ucan.xyz/)
- [Web Tiles](https://berjon.com/web-tiles/)


![polypody](polypody.jpg)
