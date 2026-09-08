import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectories = [
  new URL('../coverage/', import.meta.url),
  new URL('../dist/', import.meta.url),
];

for (const outputDirectoryUrl of outputDirectories) {
  const outputDirectory = fileURLToPath(outputDirectoryUrl);
  if (!outputDirectory.startsWith(repositoryRoot)) {
    throw new Error(`Refusing to clean outside the repository: ${outputDirectory}`);
  }
  rmSync(outputDirectory, { recursive: true, force: true });
}
