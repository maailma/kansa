var fs = require('fs'),
    glob = require('glob'),
    path = require('path');

function csvQuote(str) {
  if (str === null) return '';
  if (typeof str === 'string') {
    if (/^\w+$/.test(str)) return str;
    if (str.indexOf('"') !== -1) str = str.replace(/"/g, '\\"');
  }
  return JSON.stringify(str);
}

function csvTransaction(t) {
  var p = t.request.purchase;
  var d = p.details;
  if (p.currency !== 'eur') throw new Error('Currency mismatch! ' + d.name)
  if (p.inclPaper !== d['paper-pubs']) throw new Error('Paper pubs mismatch! ' + d.name);
  var data = [
    t.result.created, p.amount, p.type, p.upgrade, p.inclPaper,
    d.name, d.email, d.city, d.state, d.country,
    d['public-first'], d['public-last'], d['hugo-2016'],
    d['paper-name'], d['paper-address'], d['paper-country']
  ];
  return data.map(csvQuote).join(',');
}

var head = [ "time", "amount", "type", "upgrade", "inclPaper", 
             "name", "email", "city", "state", "country",
             "public-first", "public-last", "hugo-2016",
             "paper-name", "paper-address", "paper-country"
           ]
           .map(csvQuote).join(',');

var body = glob.sync('./ch_*')
           .map(function(file) {
               var fn = path.resolve(file);
               var str = fs.readFileSync(fn);
               return JSON.parse(str);
           })
           .map(csvTransaction)
           .join('\n');

console.log(head + '\n' + body);
