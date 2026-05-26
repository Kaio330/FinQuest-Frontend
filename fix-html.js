const fs = require('fs');
let html = fs.readFileSync('src/app/pages/dashboard/dashboard.html', 'utf8');

// The angular component typescript now has iconColor instead of iconClass for Achievement
html = html.replace('[ngClass]="achiev.iconClass"', '[ngClass]="achiev.iconColor"');

fs.writeFileSync('src/app/pages/dashboard/dashboard.html', html);
