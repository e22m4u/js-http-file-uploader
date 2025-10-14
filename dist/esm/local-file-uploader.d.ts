import { Flatten } from './types.js';
import { IncomingMessage } from 'http';
import { FileData } from './file-data.js';
import { ServiceContainer } from '@e22m4u/js-service';
import { ThumbnailFormat } from './thumbnail-service.js';
import { DebuggableService } from './debuggable-service.js';
/**
 * Local file uploader options.
 */
export declare class LocalFileUploaderOptions {
    targetDir?: string;
    maxFileSize?: number;
    maxFilesNumber?: number;
    createThumbnails?: boolean;
    thumbnailSizes?: number[];
    thumbnailFormat?: ThumbnailFormat;
    thumbnailQuality?: number;
    /**
     * Constructor.
     *
     * @param input
     */
    constructor(input?: LocalFileUploaderOptions);
}
/**
 * Local file uploader default options.
 */
export declare const LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS: Flatten<Required<LocalFileUploaderOptions>>;
/**
 * Local file uploader.
 */
export declare class LocalFileUploader extends DebuggableService {
    /**
     * Options.
     */
    options: Flatten<Required<LocalFileUploaderOptions>>;
    /**
     * Constructor.
     *
     * @param container
     * @param options
     */
    constructor(container?: ServiceContainer, options?: LocalFileUploaderOptions);
    /**
     * Upload files from request.
     *
     * @param req
     * @param field
     */
    uploadFilesFromRequest(req: IncomingMessage, field: string, container?: string): Promise<FileData[]>;
}
