
# TODO

- [ ] Make a straight up port of picopds wrapping @atproto/repo (but not app.bsky)
  - [ ] Make an on-disk `RepoStorage` implementation based on the Memory and SQL ones
  - [ ] Create a `polypod new` command that creates a new user and as part of that runs `Repo.create()` (https://github.com/bluesky-social/atproto/blob/0c815b964c030aa0f277c40bf9786f130dc320f4/packages/repo/src/repo.ts#L84)
- [ ] Make a `polypod` command that's used to run a server, manage config, generate keys…
  - [ ] Manage config (default and `-c`)
  - [ ] Generate keys (part of `new`)
  - [ ] Run server
- [ ] Add validation
- [ ] Add multiuser
- [ ] Add own implementation of whatever is proxied
- [ ] What parts of com.atproto are not implemented but needed?
- [ ] Create the simplest protocol to load from WASM
