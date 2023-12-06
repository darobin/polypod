
import { InvalidRequestError } from '@atproto/xrpc-server';
import { validateHandle, resolveHandle } from '../../../handles.js';
import lexicons from '../../../lexicons.js';

export default function makeCreateAccount (pds) {
  return {
    nsid: 'com.atproto.server.createAccount',
    lexicon: lexicons.com.atproto.server.createAccount,
    handler: async ({ input }) => {
      let { handle } = input.body;
      const { email, password, inviteCode, did } = input.body;
      if (!inviteCode) throw new InvalidRequestError('No invite code provided', 'InvalidInviteCode');
      handle = validateHandle(handle);
      if (!did) throw new InvalidRequestError('No DID provided', 'UnsupportedDomain');
      const resolvedDID = await resolveHandle(handle);
      if (resolvedDID !== did) {
        throw new InvalidRequestError('External handle did not resolve to DID', 'UnsupportedDomain');
      }
      if (!await pds.ctx.data.invites.isAvailable(inviteCode)) {
        throw new InvalidRequestError('Invite code not available', 'InvalidInviteCode');
      }

      // XXX
      // - check that email doesn't exist
      // - check that handle doesn't exist
      // - create DID
      // - hash password
      // - create account
      // - mark invite as used
      // - create the JWT tokens
      // - create the repo
      // - return


      // XXX need to build
      // - a DID indirection, something like PLC but purely local for now — same ops
      // - check and use of invite codes
      // - accounts db that can register people
      // - repo creation code that can build and store on WNFS
      // - the JWT stuff (just grab it)

    },
  };
}

// // determine the did & any plc ops we need to send
// // if the provided did document is poorly setup, we throw
// const { did, plcOp } = await getDidAndPlcOp(ctx, handle, input.body)

// const now = new Date().toISOString()
// const passwordScrypt = await scrypt.genSaltAndHash(password)

// const result = await ctx.db.transaction(async (dbTxn) => {
//   const actorTxn = ctx.services.account(dbTxn)
//   const repoTxn = ctx.services.repo(dbTxn)

//   // it's a bit goofy that we run this logic twice,
//   // but we run it once for a sanity check before doing scrypt & plc ops
//   // & a second time for locking + integrity check
//   if (ctx.cfg.inviteRequired && inviteCode) {
//     await ensureCodeIsAvailable(dbTxn, inviteCode, true)
//   }

//   // Register user before going out to PLC to get a real did
//   try {
//     await actorTxn.registerUser({ email, handle, did, passwordScrypt })
//   } catch (err) {
//     if (err instanceof UserAlreadyExistsError) {
//       const got = await actorTxn.getAccount(handle, true)
//       if (got) {
//         throw new InvalidRequestError(`Handle already taken: ${handle}`)
//       } else {
//         throw new InvalidRequestError(`Email already taken: ${email}`)
//       }
//     }
//     throw err
//   }

//   // Generate a real did with PLC
//   if (plcOp) {
//     try {
//       await ctx.plcClient.sendOperation(did, plcOp)
//     } catch (err) {
//       req.log.error(
//         { didKey: ctx.plcRotationKey.did(), handle },
//         'failed to create did:plc',
//       )
//       throw err
//     }
//   }

//   // insert invite code use
//   if (ctx.cfg.inviteRequired && inviteCode) {
//     await dbTxn.db
//       .insertInto('invite_code_use')
//       .values({
//         code: inviteCode,
//         usedBy: did,
//         usedAt: now,
//       })
//       .execute()
//   }

//   const access = ctx.auth.createAccessToken({ did })
//   const refresh = ctx.auth.createRefreshToken({ did })
//   await ctx.services.auth(dbTxn).grantRefreshToken(refresh.payload, null)

//   // Setup repo root
//   await repoTxn.createRepo(did, [], now)

//   return {
//     did,
//     accessJwt: access.jwt,
//     refreshJwt: refresh.jwt,
//   }
// })

// return {
//   encoding: 'application/json',
//   body: {
//     handle,
//     did: result.did,
//     accessJwt: result.accessJwt,
//     refreshJwt: result.refreshJwt,
//   },
// }
