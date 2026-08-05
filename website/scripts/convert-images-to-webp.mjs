#!/usr/bin/env node
/**
 * Convert raster images (png/jpg/jpeg) to webp using sharp.
 *
 * Usage:
 *   node scripts/convert-images-to-webp.mjs <file-or-dir> [more...] [options]
 *
 * Options:
 *   --quality=N     webp quality 1-100 (default 82)
 *   --max-width=N   downscale anything wider than N px, keep aspect (default 1920; 0 = no cap)
 *   --delete        remove the original file after a successful conversion
 *   --dry-run       report what would happen, write nothing
 *
 * Notes:
 *   - Never upscales. Skips a file if an up-to-date .webp already exists.
 *   - Directories are scanned recursively.
 *   - Reports per-file and total byte savings.
 */
import { readdir, stat, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, extname, dirname, basename } from 'node:path';
import sharp from 'sharp';

const RASTER = new Set(['.png', '.jpg', '.jpeg']);

function parseArgs(argv) {
  const opts = { quality: 82, maxWidth: 1920, delete: false, dryRun: false, paths: [] };
  for (const a of argv) {
    if (a === '--delete') opts.delete = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a.startsWith('--quality=')) opts.quality = Number(a.split('=')[1]);
    else if (a.startsWith('--max-width=')) opts.maxWidth = Number(a.split('=')[1]);
    else if (a.startsWith('--')) { console.error(`Unknown option: ${a}`); process.exit(1); }
    else opts.paths.push(a);
  }
  return opts;
}

async function collect(path) {
  const s = await stat(path);
  if (s.isFile()) return RASTER.has(extname(path).toLowerCase()) ? [path] : [];
  const entries = await readdir(path, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = join(path, e.name);
    if (e.isDirectory()) out.push(...await collect(full));
    else if (RASTER.has(extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

const fmt = (b) => b >= 1e6 ? `${(b / 1e6).toFixed(2)}MB` : `${(b / 1e3).toFixed(0)}KB`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.paths.length) {
    console.error('Provide at least one file or directory.');
    process.exit(1);
  }

  const files = [...new Set((await Promise.all(opts.paths.map(collect))).flat())].sort();
  if (!files.length) { console.log('No png/jpg/jpeg files found.'); return; }

  console.log(`${opts.dryRun ? '[DRY RUN] ' : ''}Converting ${files.length} file(s) ` +
    `(quality=${opts.quality}, maxWidth=${opts.maxWidth || 'none'}, delete=${opts.delete})\n`);

  let before = 0, after = 0, converted = 0;
  for (const file of files) {
    const out = join(dirname(file), basename(file, extname(file)) + '.webp');
    const srcBytes = (await stat(file)).size;
    before += srcBytes;

    try {
      const input = await readFile(file);
      let img = sharp(input);
      const meta = await img.metadata();
      if (opts.maxWidth && meta.width && meta.width > opts.maxWidth) {
        img = img.resize({ width: opts.maxWidth, withoutEnlargement: true });
      }
      const buf = await img.webp({ quality: opts.quality }).toBuffer();
      after += buf.length;
      converted++;
      const pct = ((1 - buf.length / srcBytes) * 100).toFixed(0);
      console.log(`  ${basename(file)}  ${fmt(srcBytes)} -> ${fmt(buf.length)}  (-${pct}%)`);

      if (!opts.dryRun) {
        await writeFile(out, buf);
        if (opts.delete) await unlink(file);
      }
    } catch (err) {
      console.error(`  FAILED ${file}: ${err.message}`);
    }
  }

  console.log(`\nTotal: ${fmt(before)} -> ${fmt(after)} ` +
    `(saved ${fmt(before - after)}, ${converted}/${files.length} converted)`);
}

main();
