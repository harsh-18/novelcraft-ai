const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/res\.status\(500\)\.json\(\{ error: \`Failed to generate content: \$\{errStr\}\` \}\);/g, `
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: \`Failed to generate content: \${errStr}\` });
        }
`);
code = code.replace(/res\.status\(500\)\.json\(\{ error: \`Failed to generate plot twists: \$\{errStr\}\` \}\);/g, `
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: \`Failed to generate plot twists: \${errStr}\` });
        }
`);
code = code.replace(/res\.status\(500\)\.json\(\{ error: \`Failed to generate chat response: \$\{errStr\}\` \}\);/g, `
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: \`Failed to generate chat response: \${errStr}\` });
        }
`);

fs.writeFileSync(file, code);
