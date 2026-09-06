const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace all instances of const data = await response.json();
code = code.replace(/const data = await response\.json\(\);/g, `
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (not JSON). Please try again.");
      }
      const data = await response.json();
`);

fs.writeFileSync(file, code);
