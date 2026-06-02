import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  '.gitignore',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/workflows/repo-sanity.yml',
  'docs/flujo-git-bmad.md',
  'docs/github-setup.md',
  'docs/rutina-codex-claude.md',
  'package.json',
  'yarn.lock',
];

const missingFiles = requiredFiles.filter((file) => !existsSync(join(root, file)));
if (missingFiles.length > 0) {
  console.error(`Missing required files:\n- ${missingFiles.join('\n- ')}`);
  process.exit(1);
}

const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');
const requiredIgnoreEntries = ['.env', 'node_modules/', '_bmad-output/', '__pycache__/'];
const missingIgnores = requiredIgnoreEntries.filter((entry) => !gitignore.includes(entry));
if (missingIgnores.length > 0) {
  console.error(`.gitignore is missing required entries:\n- ${missingIgnores.join('\n- ')}`);
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (packageJson.private !== true) {
  console.error('package.json must be private to avoid accidental publication.');
  process.exit(1);
}

function collectTestFiles(directory, results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }
      collectTestFiles(absolutePath, results);
      continue;
    }

    if (/\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(entry.name)) {
      results.push(relative(root, absolutePath));
    }
  }

  return results;
}

const srcPath = join(root, 'src');
const testFiles = existsSync(srcPath) ? collectTestFiles(srcPath) : [];
if (testFiles.length === 0) {
  console.error('No test files were found under src/. Add at least one test file before relying on CI.');
  process.exit(1);
}

console.log('Repo sanity checks passed.');
console.log(`Test files discovered: ${testFiles.length}`);
console.log(`Sample: ${testFiles.slice(0, 3).join(', ')}`);

