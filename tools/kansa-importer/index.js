process.argv.push('--color');
const colors = require('colors/safe');
const fetch = require('fetch-cookie')(require('node-fetch'));
const csvParse = require('csv-parse');
const ldj = require('ldjson-stream');
const PaperPubs = require('./paperpubs');

const csvOptions = { columns: true, skip_empty_lines: true };
const DEFAULT_EMAIL = 'registration@worldcon.fi';

const loginUrl = process.argv[2];
if (loginUrl.indexOf('/login') === -1) {
  console.error('Usage: node index.js \'https://api.server/login?...\' [--json] [--verbose] < data.csv > skipped.json');
  process.exit(1);
}
const apiRoot = loginUrl.slice(0, loginUrl.indexOf('/login'));
const isJSON = process.argv.indexOf('--json') !== -1;
const verbose = process.argv.indexOf('--verbose') !== -1;


const paperPubs = new PaperPubs(process.argv, csvOptions);
const sum = { rec: 0, join: 0, upgrade: 0, paper: 0, issueSkip: 0, emailSkip: 0, error: 0 };

fetch(loginUrl)
  .then(parseResponse)
  .then(res => {
    console.error(`Logged in as ${colors.green(res.email)} on ${colors.green(apiRoot)}\n`);
    const parser = isJSON ? ldj.parse() : csvParse(csvOptions);
    process.stdin.setEncoding('utf8');
    const stage2 = [];
    let loop = null;
    process.stdin.pipe(parser)
      .on('readable', () => {
        if (!loop) loop = setInterval(() => {
          const rec = parser.read();
          if (rec) {
            ++sum.rec;
            if (!filter(rec, true)) stage2.push(rec);
          } else {
            clearInterval(loop);
            loop = null;
          }
        }, 50);  // delay required to not saturate server
      })
      .on('end', () => {
        let i = -1;
        const endLoop = setInterval(() => {
          if (++i < stage2.length) {
            filter(stage2[i], false);
          } else {
            clearInterval(endLoop);
            setTimeout(() => {
              console.error(`\n==== Import done. Read ${sum.rec} records.`);
              console.error(`Successfully handled ${sum.join} joins, ${sum.upgrade} upgrades, and ${sum.paper} paper pubs sales.`);
              console.error(`Assigned member numbers for ${stage2.length} new members.`);
              console.error(`Skipped ${sum.issueSkip} due to issues and ${sum.emailSkip} due to missing email.`);
              console.error(`Encountered ${sum.error} errors.`);
              console.error(`${paperPubs.remaining().length}/${paperPubs.data.length} paper pubs left unhandled.`);
            }, 30*1000);
          }
        }, 50);  // delay required to not saturate server
      });
  })
  .catch(err => console.error(err));


function filter(rec, reqMemberNumber) {
  const tag = `"${rec.legal_name}" <${rec.email}>`;
  if (rec.Issues) {
    ++sum.issueSkip;
    console.error(`Skipped ${tag} due to open issue: ${rec.Issues}`);
    rec._skip = 'has issue';
    console.log(JSON.stringify(rec));
    return true;

  } else if (!rec.email && !DEFAULT_EMAIL) {
    ++sum.emailSkip;
    console.error(`Skipped ${tag} due to missing e-mail address`);
    rec._skip = 'no email';
    console.log(JSON.stringify(rec));
    return true;

  } else if (reqMemberNumber && !rec.member_number) {
    return false;

  } else {
    if (!rec.email) rec.email = DEFAULT_EMAIL;
    handle(rec, tag).catch(err => {
      ++sum.error;
      console.error(colors.red(`Error on ${tag}! ${err.message}`));
      rec._skip = 'error: ' + err.message;
      console.log(JSON.stringify(rec));
    });
    return true;
  }
}

function handle(rec, tag) {
  let data, id;
  return new Promise((resolve, reject) => {
    try {
      data = rec.supporter ? supporterData(rec) : newAttendingData(rec);
      resolve(data);
    } catch (e) {
      reject(e);
    }
  }).then(data => POST('people', data))
    .then(res => {
      id = res.id;
      ++sum.join;
      if (verbose) console.error(colors.gray(`${tag} joined as ${data.membership} on ${data.timestamp}`));
      if (rec.supporter && rec.upgrade) {
        const upgrade = upgradeData(rec);
        return POST(`people/${id}/upgrade`, upgrade).then(res => {
          ++sum.upgrade;
          if (verbose) console.error(colors.gray(`${tag} upgraded to ${upgrade.membership} on ${upgrade.timestamp}`));
        });
      }
    })
    .then(() => {
      if (rec.paper_pubs_id) {
        const pp = paperPubs.getData(rec.paper_pubs_id, rec.legal_name);
        return POST(`people/${id}/upgrade`, pp).then(res => {
          ++sum.paper;
          if (verbose) console.error(colors.gray(`${tag} got paper pubs on ${pp.timestamp}`));
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
    'adult': 'Adult',
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
