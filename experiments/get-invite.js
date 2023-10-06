
// import API from '@atproto/api';
import { pdsURL } from './data.js';

const res = await fetch(
  `${pdsURL}/xrpc/com.atproto.server.createInviteCode`,
  {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa('admin:hunter2')}`,
      'Content-Type': 'application/json',
    },
    body: '{"useCount":1}',
  }
);
if (res.status >= 400) {
  console.warn(`Status: ${res.status} ${res.statusText}`);
  console.warn(JSON.stringify(res.headers, null, 2));
  console.warn(await res.text());
}
else {
  const { code } = await res.json();
  console.warn(`Invite: ${code}`);
}
