const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const isTransient =\s*error\?\.status === 503 \|\| errStr\.includes\('503'\) \|\| errStr\.includes\('UNAVAILABLE'\) \|\| errStr\.includes\('high demand'\) \|\|\s*error\?\.status === 429 \|\| errStr\.includes\('429'\) \|\| errStr\.toLowerCase\(\)\.includes\('quota'\) \|\| errStr\.toLowerCase\(\)\.includes\('rate'\);/g, `const isTransient = 
        error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') ||
        error?.status === 504 || errStr.includes('504') ||
        error?.status === 502 || errStr.includes('502') ||
        error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate') ||
        errStr.includes("Unexpected token '<'") || errStr.includes('is not valid JSON') || errStr.includes('JSON');`);

fs.writeFileSync(file, code);
