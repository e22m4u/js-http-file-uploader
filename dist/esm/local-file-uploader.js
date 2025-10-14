import * as os from 'os';
import * as path from 'path';
import { randomBytes } from 'crypto';
import formidable from 'formidable';
import HttpErrors from 'http-errors';
import { moveFile } from './utils/index.js';
import { removeFile } from './utils/index.js';
import { formatBytes } from './utils/index.js';
import { createError } from './utils/index.js';
import { numWords } from '@e22m4u/js-localizer';
import { createDirectory } from './utils/index.js';
import { ThumbnailService } from './thumbnail-service.js';
import { DebuggableService } from './debuggable-service.js';
import { getRealFileType } from './utils/get-real-file-type.js';
import { HttpFileUploaderLocalizer } from './http-file-uploader-localizer.js';
/**
 * Local file uploader options.
 */
export class LocalFileUploaderOptions {
    targetDir;
    maxFileSize;
    maxFilesNumber;
    createThumbnails;
    thumbnailSizes;
    thumbnailFormat;
    thumbnailQuality;
    /**
     * Constructor.
     *
     * @param input
     */
    constructor(input) {
        if (input)
            Object.assign(this, input);
    }
}
/**
 * Local file uploader default options.
 */
export const LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS = {
    targetDir: 'upload',
    maxFileSize: 5 * 1000 * 1000, // 5mb
    maxFilesNumber: 10,
    createThumbnails: true,
    thumbnailSizes: [320, 640, 1024, 1920],
    thumbnailFormat: 'webp',
    thumbnailQuality: 80,
};
/**
 * Local file uploader.
 */
export class LocalFileUploader extends DebuggableService {
    /**
     * Options.
     */
    options = structuredClone(LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS);
    /**
     * Constructor.
     *
     * @param container
     * @param options
     */
    constructor(container, options) {
        super(container);
        // опции из сервис-контейнера
        if (this.hasService(LocalFileUploaderOptions)) {
            const optionsService = this.getRegisteredService(LocalFileUploaderOptions);
            const definedOptions = Object.fromEntries(Object.entries(optionsService).filter(([, value]) => value != null));
            Object.assign(this.options, definedOptions);
        }
        // опции из аргумента
        if (options) {
            const definedOptions = Object.fromEntries(Object.entries(options).filter(([, value]) => value != null));
            Object.assign(this.options, definedOptions);
        }
    }
    /**
     * Upload files from request.
     *
     * @param req
     * @param field
     */
    async uploadFilesFromRequest(req, field, container) {
        const debug = this.getDebuggerFor(this.uploadFilesFromRequest);
        const debugWo1 = debug.withOffset(1);
        const debugWo2 = debug.withOffset(2);
        const localizer = this.getService(HttpFileUploaderLocalizer);
        const thumbnailService = this.getService(ThumbnailService);
        const errorKeyPrefix = `${LocalFileUploader.name}.${this.uploadFilesFromRequest.name}`;
        debug('Uploading files.');
        const maxTotalFileSize = this.options.maxFilesNumber * this.options.maxFileSize;
        const form = formidable({
            uploadDir: os.tmpdir(),
            keepExtensions: true,
            maxFiles: this.options.maxFilesNumber,
            maxFileSize: this.options.maxFileSize,
            maxTotalFileSize,
        });
        const createdResourceDirs = [];
        const fileDataList = [];
        const files = await new Promise((resolve, reject) => {
            form.on('error', err => {
                switch (err.code) {
                    // maxFiles
                    case 1015: {
                        return reject(createError(HttpErrors.PayloadTooLarge, 'PAYLOAD_TOO_LARGE', localizer.t(`${errorKeyPrefix}.maxFilesNumberError`), { reason: err.message, errorCode: err.code }, this.options.maxFilesNumber));
                    }
                    // maxTotalFileSize
                    case 1009:
                    // maxFileSize
                    // eslint-disable-next-line no-fallthrough
                    case 1016: {
                        return reject(createError(HttpErrors.PayloadTooLarge, 'PAYLOAD_TOO_LARGE', localizer.t(`${errorKeyPrefix}.maxFileSizeError`), { reason: err.message, errorCode: err.code }, formatBytes(this.options.maxFileSize)));
                    }
                    default: {
                        return reject(createError(HttpErrors.BadRequest, 'FILE_UPLOAD_FAILED', localizer.t(`${errorKeyPrefix}.fileUploadError`), { reason: err.message, errorCode: err.code }));
                    }
                }
            });
            form.parse(req, (err, fields, files) => {
                if (err)
                    return;
                const uploadedFiles = files[field] || [];
                if (!uploadedFiles.length) {
                    return reject(createError(HttpErrors.BadRequest, 'NOTHING_TO_UPLOAD', localizer.t(`${errorKeyPrefix}.nothingToUploadError`)));
                }
                resolve(uploadedFiles);
            });
        });
        debug(numWords(files.length, '%d file received.', '%d files received.'), files.length);
        files.forEach(file => {
            debug('File %v saved to %v.', file.originalFilename, file.filepath);
        });
        try {
            for (const file of files) {
                const originalFileName = path.basename(file.originalFilename);
                debug('Processing file %v.', originalFileName);
                debugWo1('Detecting real file type.');
                const fileType = await getRealFileType(file);
                if (!fileType) {
                    throw createError(HttpErrors.BadRequest, 'INVALID_FILE', localizer.t(`${errorKeyPrefix}.invalidFileError`));
                }
                debugWo1('Detected MIME was %v (.%s).', fileType.mime, fileType.ext);
                // формирование уникального имени для папки ресурса
                const resourceName = randomBytes(16).toString('hex');
                debugWo1('Resource name was %v.', resourceName);
                const finalFileName = `file.${fileType.ext}`;
                debugWo1('Final file name was %v.', finalFileName);
                // формирование данных файла
                const fileData = {
                    fileName: finalFileName,
                    mimeType: fileType.mime,
                    originalName: originalFileName,
                    bytes: file.size,
                    thumbs: {},
                };
                // формирование адреса для загрузки файла
                const targetDir = path.resolve(this.options.targetDir);
                const resourceDir = path.resolve(targetDir, container ?? '', resourceName);
                if (container && !resourceDir.startsWith(targetDir)) {
                    throw createError(HttpErrors.BadRequest, 'INVALID_CONTAINER', 'Invalid container name provided.', { container });
                }
                debugWo1('Resource directory was %v.', resourceDir);
                const finalFilePath = path.join(resourceDir, finalFileName);
                debugWo1('Final file path was %v.', finalFilePath);
                // создание папки ресурса
                await createDirectory(resourceDir);
                debugWo1('Resource directory created.');
                createdResourceDirs.push(resourceDir);
                // перемещение временного файла в папку ресурса
                await moveFile(file.filepath, finalFilePath);
                // создание миниатюр
                if (this.options.createThumbnails &&
                    this.options.thumbnailSizes.length) {
                    const canCreateThumbs = thumbnailService.canCreateThumbnails({
                        mimetype: fileType.mime,
                        extension: fileType.ext,
                    });
                    if (canCreateThumbs) {
                        const thumbnails = await thumbnailService.createThumbnails(finalFilePath, resourceDir, this.options.thumbnailSizes, {
                            format: this.options.thumbnailFormat,
                            quality: this.options.thumbnailQuality,
                        });
                        thumbnails.forEach(thumb => {
                            fileData.thumbs[thumb.size] = thumb.fileName;
                            debugWo2('Thumbnail %d created in %v.', thumb.size, thumb.path);
                        });
                    }
                    else {
                        debugWo1('Thumbnails not supported for %v', fileType.mime);
                    }
                }
                // пополнение результирующего массива
                fileDataList.push(fileData);
            }
            debug(numWords(files.length, 'One file has been uploaded.', '%d files have been uploaded.'), files.length);
            return fileDataList;
        }
        catch (error) {
            debug('An error occurred during processing.');
            debug('Cleaning up created directories.');
            // удаление созданных директорий
            await Promise.all(createdResourceDirs.map(dir => {
                debug('Removing directory %v.', dir);
                return removeFile(dir, true);
            }));
            // удаление временных файлов загруженных formidable
            // на случай, если formidable не удалит их сам
            await Promise.all(files.map(file => {
                debug('Removing temporary file %v.', file.filepath);
                return removeFile(file.filepath, true);
            }));
            debug('Cleanup finished.');
            throw error;
        }
    }
}
