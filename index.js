const fs = require('fs');
const ignoreDirectories = ['.git', '.trash', '.obsidian', '.gitignore'];
const matter = require('gray-matter');

const notesPath = '/home/cookie/projects/obsidian-notes';

// Recursively read all files and directories apart from .git
const readDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreDirectories.includes(file)) {
            continue;
        };

        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            readDir(path);
        } else {
            console.log(`🔎 Reading note: ${path}`);
            const content = readNote(path);

            if (!content) {
                continue;
            }

            console.log(content);
            const note = matter(content);
            console.log(note.data);
        }
    }
}

const readNote = (path) => {
    // if its a text file, read it
    if (!path.endsWith('.md')) {
        return;
    }

    const content = fs.readFileSync(path, 'utf8');

    // stop execution of node totally
    return content;
}

readDir(notesPath);
