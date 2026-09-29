import { describe, expect, it } from 'vitest';
import {
  describeFolderImport,
  isLoopbackHost,
  localFolderPathError,
  logoMimeFromName,
  normalizeLocalFolderPath,
  parseLocalFolderImportResponse,
  planFolderImport,
} from '../localFolder';
import { canImportTypedLocalFolder } from '../localFolderClient';
import { inferLogoKindFromRelativePath, setLogoSourceFolderPath, emptyLogoConceptsStore } from '../logoConcepts';
import { inferGearCategoryFromRelativePath } from '../gearSelections';

describe('localFolder', () => {
  it('accepts a Windows project folder path', () => {
    expect(localFolderPathError('C:\\Users\\evely\\Documents\\logos')).toBeNull();
    expect(localFolderPathError('"C:/Users/evely/Documents/mockups/"')).toBeNull();
    expect(normalizeLocalFolderPath('"C:\\Users\\evely\\Documents\\logos\\"')).toBe(
      'C:\\Users\\evely\\Documents\\logos',
    );
  });

  it('rejects empty, relative, traversal, and system paths', () => {
    expect(localFolderPathError('')).toMatch(/Paste a folder path/);
    expect(localFolderPathError('logos')).toMatch(/full folder path/);
    expect(localFolderPathError('C:\\Users\\evely\\..\\Windows')).toMatch(/\.\./);
    expect(localFolderPathError('C:\\')).toMatch(/drive root/);
    expect(localFolderPathError('C:\\Windows\\Fonts')).toMatch(/system folder/);
    expect(localFolderPathError('\\\\server\\share')).toMatch(/network share/);
  });

  it('plans image files and skips junk, PDFs, and oversized files', () => {
    const planned = planFolderImport([
      { name: 'seal.png', relativePath: 'seal/seal.png', size: 12_000 },
      { name: '.DS_Store', relativePath: '.DS_Store', size: 80 },
      { name: 'notes.pdf', relativePath: 'notes.pdf', size: 40_000 },
      { name: 'huge.png', relativePath: 'huge.png', size: 21 * 1024 * 1024 },
    ]);
    expect(planned.take.map((item) => item.name)).toEqual(['seal.png']);
    expect(planned.skipped).toBe(3);
    expect(planFolderImport([{ name: 'mark.svg', relativePath: 'mark.svg', size: 800 }], { allowSvg: false }).take).toEqual(
      [],
    );
  });

  it('infers logo kinds and gear categories from folder names', () => {
    expect(inferLogoKindFromRelativePath('wordmark/lockup-no.png', 'seal')).toBe('wordmark');
    expect(inferLogoKindFromRelativePath('concepts/seal-v2.png', 'colorway')).toBe('seal');
    expect(inferGearCategoryFromRelativePath('hoodie/front.png', 'tee')).toBe('hoodie');
    expect(inferGearCategoryFromRelativePath('hats/cap-01.png', 'tee')).toBe('hat');
    expect(inferGearCategoryFromRelativePath('drop/t-shirt-rust.png', 'hat')).toBe('tee');
  });

  it('parses a successful folder import payload and names the result', () => {
    expect(logoMimeFromName('mark.PNG', '')).toBe('image/png');
    expect(isLoopbackHost('localhost:3001')).toBe(true);
    expect(canImportTypedLocalFolder('nonnegotiation.com')).toBe(false);
    const parsed = parseLocalFolderImportResponse(true, {
      ok: true,
      path: 'C:\\Users\\evely\\Documents\\logos',
      files: [{ name: 'seal.png', relativePath: 'seal/seal.png', dataUrl: 'data:image/png;base64,aa', kind: 'seal' }],
    });
    expect(parsed.files).toHaveLength(1);
    expect(parsed.path).toMatch(/logos/);
    expect(parseLocalFolderImportResponse(false, '<html></html>').error).toMatch(/localhost/);
    expect(describeFolderImport(3, 1, 'mockup')).toBe('Imported 3 mockups. Skipped 1.');
    const many = Array.from({ length: 80 }, (_, i) => ({
      name: `file-${i}.png`,
      relativePath: `file-${i}.png`,
      size: 1_000,
    }));
    expect(planFolderImport(many).take).toHaveLength(80);
    expect(setLogoSourceFolderPath(emptyLogoConceptsStore(), 'C:\\Users\\evely\\Documents\\logos').store.sourceFolderPath).toMatch(
      /logos/,
    );
    expect(setLogoSourceFolderPath(emptyLogoConceptsStore(), 'nope').error).toMatch(/full folder path/);
  });
});
