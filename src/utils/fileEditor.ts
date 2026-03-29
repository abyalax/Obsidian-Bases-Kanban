import type { App, TFile } from 'obsidian';

/**
 * Updates a single frontmatter property in a file.
 * Uses processFrontMatter — same pattern as handleCardDrop in kanbanView.ts.
 */
export async function updateFrontmatterProp(app: App, file: TFile, key: string, value: unknown): Promise<void> {
	await app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
		if (value === '' || value === null || value === undefined) {
			delete fm[key];
		} else {
			fm[key] = value;
		}
	});
}

/**
 * Reads the markdown body of a file (everything after the YAML frontmatter block).
 * Returns empty string if file has no body.
 */
export async function getMarkdownBody(app: App, file: TFile): Promise<string> {
	const raw = await app.vault.read(file);
	// Strip YAML frontmatter block (--- ... ---)
	const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
	if (match) return match[1];
	// No frontmatter — return full content
	if (!raw.startsWith('---')) return raw;
	return '';
}

/**
 * Saves markdown body content back to the file, preserving existing frontmatter.
 */
export async function saveMarkdownBody(app: App, file: TFile, newBody: string): Promise<void> {
	const raw = await app.vault.read(file);
	const fmMatch = raw.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/);
	if (fmMatch) {
		await app.vault.modify(file, fmMatch[1] + newBody);
	} else {
		await app.vault.modify(file, newBody);
	}
}
