const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/throw new Error\(\`Server error: \$\{response\.status\}\`\);\n\s+\}\n\s+\}/g, `throw new Error(\`Server error: \${response.status}\`);
        }
      }
      
      const data = await response.json();`);

fs.writeFileSync(file, code);
