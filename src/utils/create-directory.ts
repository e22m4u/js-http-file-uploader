import {promises as fs} from 'fs';

/**
 * Create directory if not exist.
 *
 * @param options
 */
export async function createDirectory(pathName: string): Promise<void> {
  try {
    await fs.mkdir(pathName, {recursive: true});
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create directory.');
  }
}
