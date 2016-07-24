process.argv.push('--color');
const colors = require('colors/safe');
const fetch = require('fetch-cookie')(require('node-fetch'));
const csvParse = require('csv-parse');
const ldj = require('ldjson-stream');

const csvOptions = { columns: true, skip_empty_lines: true };
const DEFAULT_EMAIL = 'registration@worldcon.fi';

const loginUrl = process.argv[2];
if (loginUrl.indexOf('/login') === -1) {
  console.error('Usage: node index.js \'https://api.server/login?...\' [--json] [--req-member-number] < data.csv > skipped.json');
  process.exit(1);
}
const apiRoot = loginUrl.slice(0, loginUrl.indexOf('/login'));
const isJSON = process.argv.indexOf('--json') !== -1;
const reqMemberNumber = process.argv.indexOf('--req-member-number') !== -1;


fetch(loginUrl)
  .then(parseResponse)
  .then(res => {
    console.error(`Logged in as ${colors.green(res.email)} on ${colors.green(apiRoot)}\n`);
    const parser = isJSON ? ldj.parse() : csvParse(csvOptions);
    process.stdin.setEncoding('utf8');
    let loop = null;
    process.stdin.pipe(parser)
      .on('readable', () => {
        if (!loop) loop = setInterval(() => {
          const rec = parser.read();
          if (rec) {
            filter(rec);
          } else {
            clearInterval(loop);
            loop = null;
          }
        }, 10);  // delay required to not saturate server
      });
  })
  .catch(err => console.error(err));


function filter(rec) {
  const tag = `"${rec.legal_name}" <${rec.email}>`;
  if (rec.Issues) {
    console.error(`Skipped ${tag} due to open issue: ${rec.Issues}`);
    rec._skip = 'has issue';
    console.log(JSON.stringify(rec));
  } else if (!rec.email && !DEFAULT_EMAIL) {
    console.error(`Skipped ${tag} due to missing e-mail address`);
    rec._skip = 'no email';
    console.log(JSON.stringify(rec));
  } else if (reqMemberNumber && !rec.member_number) {
    console.error(`Skipped ${tag} due to missing member number`);
    rec._skip = 'no member number';
    console.log(JSON.stringify(rec));
  } else {
    if (!rec.email) rec.email = DEFAULT_EMAIL;
    handle(rec, tag).catch(err => {
      console.error(colors.red(`Error on ${tag}! ${err.message}`));
      rec._skip = 'error: ' + err.message;
      console.log(JSON.stringify(rec));
    });
  }
}

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
  if (rec.upgrade_source) p.source = rec.upgrade_source;
  if (rec.upgrade_comment) p.comment = rec.upgrade_comment;
  return p;
}

function upgradeData(rec) {
  const d = {
    membership: attendingType(rec.upgrade),
    timestamp: `${rec.upgrade_date} UTC`
  };
  if (!d.membership) throw new Error('Unrecognised membership: ' + rec.upgrade);
  if (rec.upgrade_source) d.source = rec.upgrade_source;
  if (rec.upgrade_comment) d.comment = rec.upgrade_comment;
  return d;
}
