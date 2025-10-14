import {promises as fs} from 'fs';

/**
 * Safely removes file or directory and all its contents.
 * Does not throw an error if the path does not exist.
 *
 * @param pathName The path to the file or directory to remove.
 */
export async function removeFile(pathName: string): Promise<void> {
  try {
    // `recursive: true` removes contents.
    // `force: true` prevents errors if path doesn't exist.
    await fs.rm(pathName, {recursive: true, force: true});
  } catch (error) {
    // Log the error but don't re-throw, as cleanup should be best-effort.
    console.error(`Failed to remove ${pathName}:`, error);
  }
}
