const fs = require('fs');
let html = fs.readFileSync('src/app/pages/dashboard/dashboard.html', 'utf8');

if (html.includes("Trilhas")) {
    console.log("Yes, it includes it");
}
