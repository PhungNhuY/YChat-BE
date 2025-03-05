import { access, constants, stat } from 'node:fs/promises';

export async function checkFileExists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getFileSize(path: string): Promise<number> {
  const stats = await stat(path);
  return stats.size;
}
