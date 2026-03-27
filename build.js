import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, 'src');
const distDir = join(__dirname, 'dist');

// Discover all views that have an index.html
const viewsDir = join(srcDir, 'views');
const views = readdirSync(viewsDir).filter((name) => {
  return existsSync(join(viewsDir, name, 'index.html'));
});

console.log(`Building views: ${views.join(', ')}`);

const errors = [];

for (const view of views) {
  const htmlPath = join(viewsDir, view, 'index.html');
  const outDir = join(distDir, 'views', view);

  mkdirSync(outDir, { recursive: true });

  let html = readFileSync(htmlPath, 'utf8');
  const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);

  if (scriptMatch) {
    const scriptContent = scriptMatch[1].trim();

    try {
      await build({
        stdin: {
          contents: scriptContent,
          resolveDir: join(viewsDir, view),
          sourcefile: 'main.js',
        },
        bundle: true,
        minify: true,
        outfile: join(outDir, 'bundle.js'),
        format: 'iife',
      });

      html = html.replace(
        /<script type="module">[\s\S]*?<\/script>/,
        '<script src="./bundle.js"></script>'
      );

      writeFileSync(join(outDir, 'index.html'), html);
      console.log(`  ✓ ${view}`);
    } catch {
      errors.push(view);
      console.log(`  ✗ ${view} (errors above)`);
    }
  } else {
    writeFileSync(join(outDir, 'index.html'), html);
    console.log(`  - ${view} (no inline module, copied as-is)`);
  }
}

// Copy public/index.html to dist/
cpSync(join(__dirname, 'public', 'index.html'), join(distDir, 'index.html'));
console.log('  ✓ public/index.html');

// Copy README.md to dist/
cpSync(join(srcDir, 'README.md'), join(distDir, 'README.md'));
console.log('  ✓ src/README.md');

// Copy shared assets (config, locales, images)
const assetsOut = join(distDir, 'shared', 'assets');
mkdirSync(assetsOut, { recursive: true });
cpSync(join(srcDir, 'shared', 'assets'), assetsOut, { recursive: true });
console.log('  ✓ assets');

if (errors.length > 0) {
  console.log(`\nBuild completed with errors in: ${errors.join(', ')}`);
} else {
  console.log(`\nBuild complete → dist/`);
}
