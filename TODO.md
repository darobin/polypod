
- [x] make a context object that's widely available to work from
- [x] rename
- [x] udpate README
- [x] move to another DB
- [x] require baseDir, adminPwd, simple entry point
- [x] testing facility that starts with a baseDir, etc.
- [ ] make a DID service that just fakes it locally
  - [x] resolve did:polypod against local system
- [ ] abstract repo system
- [ ] make it take a config that's basically a storage directory
- [ ] go through API endpoints and implement one by one in simplest way
  - [x] make client scripts that access the API and run them until they work
  - [ ] local PLC server
  - [ ] Move Lexicons out of the submodule (with a tool) so they can be shipped (won't work as vendor)
  - [x] XRPC server to serve as PDS
  - [x] com.atproto. (don't do all, do just what we need to get something working on top)
    - [ ] server.
      - [ ] createInviteCode
        - [ ] tests
        - [ ] implementation
      - [ ] createAccount
        - [ ] tests
        - [ ] implementation
