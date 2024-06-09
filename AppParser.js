const fs = require('fs');
const matter = require('gray-matter');

/**
 * @typedef {Object} ParsedNote
 * @property {string} path - The path of the note file.
 * @property {string} content - The content of the note file.
 * @property {string} [md_parse_error] - Error message if frontmatter parsing fails.
 */

/**
 * @typedef {Object} AppParserResult
 * @property {Array<string>} columns - Array of column names.
 * @property {Array<ParsedNote>} rows - Array of parsed notes.
 */

/**
 * Parses notes in a given directory, ignoring specified directories, and returns the parsed data.
 * @param {string} notesPath - The path to the directory containing notes.
 * @param {Array<string>} [ignoredDirectories=['.git', '.trash', '.obsidian', '.gitignore']] - Array of directory names to ignore.
 * @returns {AppParserResult} An object containing the columns and rows of parsed notes.
 */
let AppParser = (notesPath, ignoredDirectories) => {
    if (ignoredDirectories === undefined) {
        ignoredDirectories = ['.git', '.trash', '.obsidian', '.gitignore'];
    }

    let columns = new Set(['path', 'content']);

    // Recursively read all files and directories apart from .git
    const readDir = (dir) => {
        let results = [];

        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (ignoredDirectories.includes(file)) {
                continue;
            };

            let result = {};

            const path = `${dir}/${file}`;
            result.path = path;
            if (fs.statSync(path).isDirectory()) {
                // Merge results from the recursive call
                results = results.concat(readDir(path));
            } else {
                // console.log(`🔎 Reading note: ${path}`);
                const content = readNote(path);

                if (!content) {
                    result.content = 'Error reading note: Not a markdown file';
                    results.push(result);
                    continue;
                }

                result.content = content;  // Use result instead of results

                // console.log(`Markdown file: ${path}`);

                try {
                    const note = matter(content);
                    // console.log(note.data);
                    // merge result with frontmatter
                    result = { ...result, ...note.data };
                    columns.add(...Object.keys(note.data));
                } catch (e) {
                    result.md_parse_error = 'Error reading frontmatter: ' + e;
                    // console.log('Error reading note');
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

    let rows = readDir(notesPath);

    // console.log(`📝 Found ${rows.length} notes`);

    return {
        columns: Array.from(columns),
        rows: rows
    };
}

module.exports = AppParser;
