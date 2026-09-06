const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const data = await response\.json\(\);/g, `
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Server returned an unexpected response. Please try again.");
      }
      const data = await response.json();
`);

fs.writeFileSync(file, code);
