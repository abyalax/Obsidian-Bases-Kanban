const { copyFileSync, mkdirSync, existsSync } = require('node:fs');
const path = require('node:path');

const sourceDir = __dirname + '/dist';
const targetDir = 'C:/Users/abya/Documents/Notes/.obsidian/plugins/kanban-bases-view';

// Ensure target directory exists
if (!existsSync(targetDir)) {
	mkdirSync(targetDir, { recursive: true });
}

// Copy files
const files = ['main.js', 'manifest.json', 'styles.css'];

files.forEach((file) => {
	const sourcePath = path.join(sourceDir, file);
	const targetPath = path.join(targetDir, file);

	if (existsSync(sourcePath)) {
		copyFileSync(sourcePath, targetPath);
		console.log(`Copied ${file} to plugin folder`);
	} else {
		console.log(`Warning: ${file} not found in dist/`);
	}
});

console.log('Plugin files copied successfully!');
