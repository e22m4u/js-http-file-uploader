/**
 * File data.
 */
export type FileData = {
    fileName?: string;
    mimeType?: string;
    originalName?: string;
    bytes?: number;
    thumbs?: Record<string, string>;
};
