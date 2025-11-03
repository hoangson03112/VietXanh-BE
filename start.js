const path = require('path');
const fs = require('fs');

console.log('🔍 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Try different possible paths
const possiblePaths = [
  path.join(process.cwd(), 'dist', 'server.js'),
  path.join(__dirname, 'dist', 'server.js'),
  path.join(process.cwd(), '..', 'dist', 'server.js'),
  path.join(__dirname, '..', 'dist', 'server.js'),
];

console.log('\n🔎 Checking possible paths:');
let foundPath = null;

for (const p of possiblePaths) {
  console.log(`  - ${p}... ${fs.existsSync(p) ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  if (fs.existsSync(p) && !foundPath) {
    foundPath = p;
  }
}

if (foundPath) {
  console.log(`\n✅ Found server at: ${foundPath}`);
  console.log('🚀 Starting server...\n');
  require(foundPath);
} else {
  console.error('\n❌ ERROR: Could not find dist/server.js in any expected location');
  console.log('\n📂 Current directory contents:');
  try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => {
      const stat = fs.statSync(path.join(process.cwd(), file));
      console.log(`  ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (err) {
    console.error('Could not list directory:', err.message);
  }
  process.exit(1);
}
