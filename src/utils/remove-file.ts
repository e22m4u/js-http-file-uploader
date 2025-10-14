import {promises as fs} from 'fs';

/**
 * Safely removes file or directory and all its contents.
 * Does not throw an error if the path does not exist.
 *
 * @param pathName The path to the file or directory to remove.
 * @param silent   Do not throw errors.
 */
export async function removeFile(
  pathName: string,
  silent = false,
): Promise<void> {
  try {
    // `recursive: true` removes contents.
    // `force: true` prevents errors if path doesn't exist.
    await fs.rm(pathName, {recursive: true, force: true});
  } catch (error) {
    console.error(`Failed to remove ${pathName}:`, error);
    if (!silent) throw error;
  }
}
