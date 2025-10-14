/**
 * Safely removes file or directory and all its contents.
 * Does not throw an error if the path does not exist.
 *
 * @param pathName The path to the file or directory to remove.
 */
export declare function removeFile(pathName: string): Promise<void>;
