const AppParser = require('./AppParser.js');
const fs = require('fs');
const Papa = require('papaparse');

const results = AppParser('/home/cookie/projects/obsidian-notes', ['.git', '.obsidian', '.gitignore']);

// Convert to CSV
const csv = Papa.unparse(results.rows, {
    header: true,
    columns: results.columns
});
fs.writeFileSync('storage/results.csv', csv);
