const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const errorData = await response\.json\(\)\.catch\(\(\) => null\);\s+throw new Error\(errorData\?\.error \|\| 'Failed to complete request'\);/g, `
          let errorData = null;
          try {
             const text = await response.text();
             errorData = JSON.parse(text);
          } catch(e) {}
          throw new Error(errorData?.error || (response.status === 429 ? 'Rate limit exceeded. Please wait a minute.' : 'Failed to complete request'));
`);

fs.writeFileSync(file, code);
