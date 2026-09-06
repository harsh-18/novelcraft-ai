const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const contentType = response\.headers\.get\("content-type"\);\s+if \(!contentType \|\| !contentType\.includes\("application\/json"\)\) \{\s+const text = await response\.text\(\);\s+throw new Error\("The server took too long to respond\. Please try again\."\);\s+\}/g, ``);

fs.writeFileSync(file, code);
