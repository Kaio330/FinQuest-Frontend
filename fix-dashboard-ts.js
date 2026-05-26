const fs = require('fs');
let ts = fs.readFileSync('src/app/pages/dashboard/dashboard.ts', 'utf8');

// Needs to change iconClass to iconColor in Achievement
ts = ts.replace("iconClass: 'icon-emerald'", "iconColor: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-emerald-400'");
ts = ts.replace("iconClass: 'icon-purple'", "iconColor: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-400'");

ts = ts.replace("iconClass: string;", "iconColor: string;");

fs.writeFileSync('src/app/pages/dashboard/dashboard.ts', ts);
