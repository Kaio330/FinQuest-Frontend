const fs = require('fs');
let ts = fs.readFileSync('src/app/pages/dashboard/dashboard.ts', 'utf8');

ts = ts.replace("activeTab = signal<string>('dashboard');", "activeTab = signal<string>('trilhas');");

fs.writeFileSync('src/app/pages/dashboard/dashboard.ts', ts);
