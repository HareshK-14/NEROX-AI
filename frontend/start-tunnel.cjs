const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting localtunnel...');
const lt = exec('npx localtunnel --port 5173');

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('STDOUT:', output);
  if (output.includes('url is:')) {
    const url = output.trim();
    fs.writeFileSync(path.join(__dirname, 'tunnel_url.txt'), url);
    console.log('Saved URL to file:', url);
  }
});

lt.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

lt.on('close', (code) => {
  console.log(`localtunnel process exited with code ${code}`);
});
