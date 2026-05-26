const fs = require('fs');
let ts = fs.readFileSync('src/app/app.routes.ts', 'utf8');

ts = ts.replace("redirectTo: \"dashboard\"", "redirectTo: \"dashboard\"");
ts = ts.replace("path: \"inicio\",\n        component: Inicio\n    },", "path: \"inicio\",\n        component: Inicio\n    },");

fs.writeFileSync('src/app/app.routes.ts', ts);
