process.argv.push('--color');
const colors = require('colors/safe');
const fetch = require('fetch-cookie')(require('node-fetch'));
const parser = require('csv-parse')({
  columns: true,
  skip_empty_lines: true
});

const DEFAULT_EMAIL = 'registration@worldcon.fi';

const loginUrl = process.argv[2];
if (loginUrl.indexOf('/login') === -1) {
  console.error('Usage: node index.js \'https://api.server/login?...\' < data.csv > skipped.json');
  process.exit(1);
}
const apiRoot = loginUrl.slice(0, loginUrl.indexOf('/login'));

let loop = null;
parser.on('readable', () => {
  if (!loop) loop = setInterval(() => {
    const rec = parser.read();
    if (rec) {
      const tag = `"${rec.legal_name}" <${rec.email}>`;
      if (rec.Issues) {
        console.error(`Skipped ${tag} due to open issue: ${rec.Issues}`);
        console.log(JSON.stringify(rec));
      } else if (!rec.email && !DEFAULT_EMAIL) {
        console.error(`Skipped ${tag} due to missing e-mail address`);
        console.log(JSON.stringify(rec));
      } else {
        if (!rec.email) rec.email = DEFAULT_EMAIL;
        handle(rec, tag).catch(err => {
          console.error(colors.red(`Error on ${tag}! ${err.message}`));
          console.log(JSON.stringify(rec));
        });
      }
    } else {
      clearInterval(loop);
      loop = null;
    }
  }, 10);  // delay required to not saturate server
});

fetch(loginUrl).then(parseResponse)
  .then(login => {
    console.error(`Logged in as ${colors.green(login.email)} on ${colors.green(apiRoot)}\n`);
    process.stdin.setEncoding('utf8');
    process.stdin.pipe(parser);
  })
  .catch(err => console.error(err));

function handle(rec, tag) {
  let data;
  return new Promise((resolve, reject) => {
    try {
      data = rec.supporter ? supporterData(rec) : newAttendingData(rec);
      resolve(data);
    } catch (e) {
      reject(e);
    }
  }).then(data => POST('people', data))
    .then(res => {
      console.error(colors.gray(`${tag} joined as ${data.membership} on ${data.timestamp}`));
      if (rec.supporter && rec.upgrade) {
        const upgrade = upgradeData(rec);
        return POST(`people/${res.id}/upgrade`, upgrade).then(res => {
          console.error(colors.gray(`${tag} upgraded to ${upgrade.membership} on ${upgrade.timestamp}`));
        });
      }
    });
}

function POST(cmd, data) {
  return fetch(`${apiRoot}/${cmd}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(parseResponse);
}

function parseResponse(res) {
  return res.ok ? res.json() : res.json().then(body => {
    const error = new Error(`${res.statusText} (${res.status}): ${body.message}`);
    error.url = res.url;
    error.body = body;
    throw error;
  });
}

function personData(rec) {
  return [
    'member_number',
    'legal_name',
    'public_first_name', 'public_last_name',
    'email',
    'city', 'state', 'country',
    'badge_text'
  ].reduce((data, key) => {
    const v = rec[key];
    if (v) data[key] = v;
    return data;
  }, {});
}

function attendingType(type) {
  return {
    'bid friend': 'Adult',
    'bid subscriber': 'Adult',
    'child': 'Child',
    'first worldcon': 'FirstWorldcon',
    'goh': 'Adult',
    'kid-in-tow': 'KidInTow',
    'new attending': 'Adult',
    'upgrade to attending': 'Adult',
    'upgrade to first worldcon': 'FirstWorldcon',
    'upgrade to youth attending': 'Youth',
    'youth': 'Youth'
  }[type.toLowerCase()];
}

function supporterData(rec) {
  const p = personData(rec);
  p.membership = 'Supporter';
  p.timestamp = `${rec.supporter_date} UTC`;
  p.voter = rec.supporter.toLowerCase() == 'voter';
  if (rec.supporter_source) p.source = rec.supporter_source;
  if (rec.supporter_comment) p.comment = rec.supporter_comment;
  return p;
}

function newAttendingData(rec) {
  const p = personData(rec);
  p.membership = attendingType(rec.upgrade);
  if (!p.membership) throw new Error('Unrecognised membership: ' + rec.upgrade);
  p.timestamp = `${rec.upgrade_date} UTC`;
  if (rec.upgrade_source) rec.source = rec.upgrade_source;
  if (rec.upgrade_comment) rec.comment = rec.upgrade_comment;
  return p;
}

function upgradeData(rec) {
  const d = {
    membership: attendingType(rec.upgrade),
    timestamp: `${rec.upgrade_date} UTC`
  };
  if (!d.membership) throw new Error('Unrecognised membership: ' + rec.upgrade);
  if (rec.upgrade_source) rec.source = rec.upgrade_source;
  if (rec.upgrade_comment) rec.comment = rec.upgrade_comment;
  return d;
}
