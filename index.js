const fs = require('fs');
const ignoreDirectories = ['.git', '.trash', '.obsidian', '.gitignore'];
const matter = require('gray-matter');
const Papa = require('papaparse');

const notesPath = '/home/cookie/projects/obsidian-notes';

// Recursively read all files and directories apart from .git
const readDir = (dir) => {
    let results = [];

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreDirectories.includes(file)) {
            continue;
        };

        const result = {};

        const path = `${dir}/${file}`;
        result.path = path;
        if (fs.statSync(path).isDirectory()) {
            // Merge results from the recursive call
            results = results.concat(readDir(path));
        } else {
            console.log(`🔎 Reading note: ${path}`);
            const content = readNote(path);

            if (!content) {
                result.content = null;
                results.push(result);
                continue;
            }

            result.content = content;  // Use result instead of results

            console.log(`Markdown file: ${path}`);

            try {
                const note = matter(content);
                console.log(note.data);
                result.frontmatter = note.data;  // Use result instead of results
            } catch (e) {
                result.frontmatter = null;
                console.log('Error reading note');
            }

            results.push(result);
        }
    }

    return results;  // Ensure the accumulated results are returned
}

const readNote = (path) => {
    // if its a text file, read it
    if (!path.endsWith('.md')) {
        return null;  // Ensure we return null for non-markdown files
    }

    const content = fs.readFileSync(path, 'utf8');

    // stop execution of node totally
    return content;
}

let results2 = readDir(notesPath);

console.log(`📝 Found ${results2.length} notes`);

// Convert to CSV
const csv = Papa.unparse(results2);
fs.writeFileSync('storage/results.csv', csv);
