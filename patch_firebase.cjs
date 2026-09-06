const fs = require('fs');
const file = 'src/lib/firebase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import firebaseConfigJson from "\.\.\/\.\.\/firebase-applet-config\.json";\n/g, '');
code = code.replace(/ \|\| firebaseConfigJson\.projectId/g, '');
code = code.replace(/ \|\| firebaseConfigJson\.appId/g, '');
code = code.replace(/ \|\| firebaseConfigJson\.apiKey/g, '');
code = code.replace(/ \|\| firebaseConfigJson\.authDomain/g, '');
code = code.replace(/ \|\| firebaseConfigJson\.firestoreDatabaseId/g, '');

fs.writeFileSync(file, code);
