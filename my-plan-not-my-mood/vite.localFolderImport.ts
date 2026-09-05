import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  LOCAL_FOLDER_IMPORT_PATH,
  MAX_FOLDER_IMPORT_DEPTH,
  fileNameFromRelativePath,
  localFolderPathError,
  logoMimeFromName,
  normalizeLocalFolderPath,
  planFolderImport,
  shouldSkipImportDirName,
  shouldSkipImportFileName,
} from './src/lib/localFolder';
import {
  HERO_CAROUSEL_PUBLIC_DIR,
  HERO_CAROUSEL_SOURCE_FOLDER,
  HERO_CAROUSEL_SYNC_PATH,
  isHeroCarouselImageName,
  sanitizeHeroCarouselFileName,
} from './src/lib/heroCarousel';
import { inferLogoKindFromRelativePath } from './src/lib/logoConcepts';
import { inferGearCategoryFromRelativePath } from './src/lib/gearSelections';

function isLoopbackAddress(addr?: string | null): boolean {
  const value = String(addr ?? '');
  return value === '127.0.0.1' || value === '::1' || value === ':ffff:127.0.0.1' || value === '::ffff:127.0.0.1';
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > 8_192) throw new Error('too large');
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function walkFolder(
  absDir: string,
  relative: string,
  depth: number,
  acc: { abs: string; relativePath: string; size: number }[],
): Promise<void> {
  if (depth > MAX_FOLDER_IMPORT_DEPTH) return;
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipImportDirName(entry.name)) continue;
      await walkFolder(abs, rel, depth + 1, acc);
      continue;
    }
    if (!entry.isFile() || shouldSkipImportFileName(entry.name)) continue;
    const stat = await fs.stat(abs);
    acc.push({ abs, relativePath: rel.replace(/\\/g, '/'), size: stat.size });
  }
}

async function importFromPath(rawPath: string) {
  const folderPath = normalizeLocalFolderPath(rawPath);
  const pathError = localFolderPathError(folderPath);
  if (pathError) return { status: 400, body: { ok: false, error: pathError } };

  let stat;
  try {
    stat = await fs.stat(folderPath);
  } catch {
    return { status: 404, body: { ok: false, error: 'That folder is not on this computer.' } };
  }

  const collected: { abs: string; relativePath: string; size: number }[] = [];
  if (stat.isFile()) {
    collected.push({
      abs: folderPath,
      relativePath: fileNameFromRelativePath(folderPath),
      size: stat.size,
    });
  } else if (stat.isDirectory()) {
    await walkFolder(folderPath, '', 1, collected);
  } else {
    return { status: 400, body: { ok: false, error: 'Point to a file or folder on this computer.' } };
  }

  const planned = planFolderImport(
    collected.map((item) => ({
      name: fileNameFromRelativePath(item.relativePath),
      relativePath: item.relativePath,
      size: item.size,
    })),
  );

  const files = [];
  for (const item of planned.take) {
    const match = collected.find((row) => row.relativePath === item.relativePath);
    if (!match) continue;
    const bytes = await fs.readFile(match.abs);
    const mime = logoMimeFromName(item.name, item.type);
    files.push({
      name: item.name,
      relativePath: item.relativePath,
      mime,
      dataUrl: `data:${mime};base64,${bytes.toString('base64')}`,
      kind: inferLogoKindFromRelativePath(item.relativePath, 'seal'),
      category: inferGearCategoryFromRelativePath(item.relativePath, 'tee'),
    });
  }

  return {
    status: 200,
    body: {
      ok: true,
      path: folderPath,
      skipped: planned.skipped,
      files,
    },
  };
}

async function syncHeroCarouselFromPath(rawPath: string) {
  const folderPath = normalizeLocalFolderPath(rawPath || HERO_CAROUSEL_SOURCE_FOLDER);
  const pathError = localFolderPathError(folderPath);
  if (pathError) return { status: 400, body: { ok: false, error: pathError } };

  let stat;
  try {
    stat = await fs.stat(folderPath);
  } catch {
    return { status: 404, body: { ok: false, error: 'That folder is not on this computer.' } };
  }
  if (!stat.isDirectory()) {
    return { status: 400, body: { ok: false, error: 'Point to the WebsiteSS folder on this computer.' } };
  }

  const destDir = path.join(process.cwd(), 'public', 'images', 'hero-carousel');
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const files: { name: string; src: string }[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !isHeroCarouselImageName(entry.name)) continue;
    const name = sanitizeHeroCarouselFileName(entry.name);
    await fs.copyFile(path.join(folderPath, entry.name), path.join(destDir, name));
    files.push({ name, src: `${HERO_CAROUSEL_PUBLIC_DIR}/${name}` });
  }

  return {
    status: 200,
    body: { ok: true, path: folderPath, files },
  };
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Dev-only: read a typed local folder path from loopback Admin Studio. */
export function localFolderImportPlugin(): Plugin {
  return {
    name: 'local-folder-import',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== LOCAL_FOLDER_IMPORT_PATH && url !== HERO_CAROUSEL_SYNC_PATH) {
          next();
          return;
        }
        if (!isLoopbackAddress(req.socket.remoteAddress)) {
          sendJson(res, 403, { ok: false, error: 'Path import only works from this computer.' });
          return;
        }
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'POST a folder path to import.' });
          return;
        }
        try {
          const body = (await readJsonBody(req)) as { path?: unknown };
          const result =
            url === HERO_CAROUSEL_SYNC_PATH
              ? await syncHeroCarouselFromPath(String(body.path ?? HERO_CAROUSEL_SOURCE_FOLDER))
              : await importFromPath(String(body.path ?? ''));
          sendJson(res, result.status, result.body);
        } catch {
          sendJson(res, 400, { ok: false, error: 'Could not read that folder path.' });
        }
      });
    },
  };
}
