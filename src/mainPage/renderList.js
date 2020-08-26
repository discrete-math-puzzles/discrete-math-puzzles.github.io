const pug = require('pug');
const data = require('./data');
const path = require('path');
const fs = require('fs');

const file = path.resolve(__dirname, 'list.pug');
const compiledFunction = pug.compileFile(file, {pretty: true});

const html = compiledFunction({
    data,
});

console.log(html);

fs.writeFileSync("index.html", html);
