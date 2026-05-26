const fs = require('fs');
let angularJson = fs.readFileSync('angular.json', 'utf8');

if (!angularJson.includes('tailwindcss')) {
  console.log("Tailwind needs to be installed, wait it's already using tailwind classes in the html provided by user. Is it actually using Tailwind? Let's check package.json");
}
