const fs = require('fs');
const file = 'src/components/Dashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const data = await response\.json\(\);/g, `
      let data;
      try {
        const textResponse = await response.text();
        data = JSON.parse(textResponse);
      } catch (parseError) {
        if (response.status === 429 || response.status === 503 || response.status === 504) {
          throw new Error("The AI model is experiencing high demand or rate limits. Please try again later.");
        }
        throw new Error("Server returned an invalid response. This usually happens during a network proxy timeout.");
      }
`);

fs.writeFileSync(file, code);
