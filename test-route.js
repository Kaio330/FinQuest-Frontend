const fs = require('fs');
let ts = fs.readFileSync('src/app/app.routes.ts', 'utf8');

console.log(ts);
