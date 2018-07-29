process.argv.push('--color');
const colors = require('colors/safe');
const csvParseSync = require('csv-parse/lib/sync');
const fetch = require('fetch-cookie')(require('node-fetch'));
const fs = require('fs');

const categoryMap = require('./category-map.json');


const loginUrl = process.argv[2];
if (loginUrl.indexOf('/login') === -1) {
  console.error('Usage: node import.js \'https://api.server/login?...\' data.csv > errors.json');
  process.exit(1);
}
const apiRoot = loginUrl.slice(0, loginUrl.indexOf('/login'));

const csvFn = process.argv[3];
const csv = fs.readFileSync(csvFn, { encoding: 'utf8' });
const data = csvParseSync(csv, { columns: true, skip_empty_lines: true })
  .filter(rec => Object.keys(rec).filter(key => rec[key]).length > 2);
console.error(`Input data has ${colors.green(data.length - 1)} ballots`);


function parseResponse(res) {
  return res.ok ? res.json() : res.json().then(body => {
      const error = new Error(`${res.statusText} (${res.status}): ${body.message}`);
      error.url = res.url;
      error.body = body;
      throw error;
    });
}

function GET(cmd) {
  return fetch(`${apiRoot}/${cmd}`).then(parseResponse);
}

function POST(cmd, data) {
  return fetch(`${apiRoot}/${cmd}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(parseResponse);
}

const queue = [];

/*
 * last_update, {novel,novella,...}*[1-5]
 */
function enqueue(id, rec) {
  Object.keys(categoryMap).forEach(category => {
    const map = categoryMap[category];
    const keys = Object.keys(map).filter(key => map[key]);
    const nominations = [];
    for (let i = 1; i <= 5; ++i) {
      const nom = {};
      let set = false;
      keys.forEach(key => {
        const val = rec[map[key] + i];
        if (val) {
          nom[key] = val;
          set = true;
        }
      });
      if (set) nominations.push(nom);
    }
    if (nominations.length) {
      queue.push({ id, category, nominations });
    }
  });
}


const sum = { rec: 0, post: 0, error: 0 };
Object.keys(categoryMap).forEach(cat => sum[cat] = 0);

fetch(loginUrl)
  .then(parseResponse)
  .then(res => {
    console.error(`Logged in as ${colors.green(res.email)} on ${colors.green(apiRoot)}`);
    return GET('kansa/people?hugo_nominator=true');
  })
  .then(people => {
    console.error(`Found ${colors.green(people.length)} nominators`);
    for (let i = 0; (i < data.length) && people[i]; ++i) {
      ++sum.rec;
      enqueue(people[i].id, data[i]);
    }
    console.error(`Queued ${colors.green(queue.length)} ballot posts\n`);
    let i = 0;
    let loop = setInterval(() => {
      const { id, category, nominations } = queue[i++];
      if (id) {
        ++sum[category];
        ++sum.post;
        POST(`hugo/${id}/nominate`, {
          signature: 'x',
          category,
          nominations
        }).catch(err => { ++sum.error; console.log(err); });
        if (i % 100 === 0) console.error(i);
      } else {
        clearInterval(loop);
        setTimeout(() => {
          console.error(`\n==== Import done. Read ${sum.rec} records.`);
          console.error(`Encountered ${sum.error} errors.`);
          console.error(`Made ${sum.error} POST requests.`);
          console.error('Raw sums:' , sum);
        }, 10 * 1000);
      }
    }, 30);  // delay required to not saturate server
  });
