const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets');

const files = fs.readdirSync(dir).filter(f => f.match(/\.(png|webp)$/i));

// Group by base name
const groups = {};

files.forEach(file => {
  const match = file.match(/^(.*?)(png|webp)$/i);
  if (match) {
    const base = match[1];
    const type = match[2];
    if (!groups[base]) groups[base] = {};
    groups[base][type] = file;
  }
});

fs.writeFileSync('images.json', JSON.stringify(groups, null, 2));
console.log('images.json generated!');
