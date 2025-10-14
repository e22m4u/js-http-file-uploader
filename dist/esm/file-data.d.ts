/**
 * File data.
 */
export type FileData = {
    name?: string;
    mime?: string;
    originalName?: string;
    bytes?: number;
    thumbs?: Record<string, string>;
};
