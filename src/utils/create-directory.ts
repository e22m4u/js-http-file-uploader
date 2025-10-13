import {promises as fs} from 'fs';
import {Errorf} from '@e22m4u/js-format';

/**
 * Create directory if not exist.
 *
 * @param options
 */
export async function createDirectory(
  pathName: string,
): Promise<void> {
  try {
    await fs.mkdir(pathName, {recursive: true});
  } catch (error) {
    console.error(error);
    throw new Errorf('Failed to create directory %v.', pathName);
  }
}
