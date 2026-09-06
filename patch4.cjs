const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const data = await response\.json\(\);\s+const data = await response\.json\(\);/g, `const data = await response.json();`);

fs.writeFileSync(file, code);
