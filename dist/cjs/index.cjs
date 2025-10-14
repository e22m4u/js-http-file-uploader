"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/esm/index.js
var index_exports = {};
__export(index_exports, {
  LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS: () => LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS,
  LocalFileUploader: () => LocalFileUploader,
  LocalFileUploaderOptions: () => LocalFileUploaderOptions,
  formatBytes: () => formatBytes
});
module.exports = __toCommonJS(index_exports);

// dist/esm/local-file-uploader.js
var os = __toESM(require("os"), 1);
var path2 = __toESM(require("path"), 1);
var import_crypto = require("crypto");
var import_formidable = __toESM(require("formidable"), 1);
var import_http_errors = __toESM(require("http-errors"), 1);

// dist/esm/utils/move-file.js
var import_fs = require("fs");
async function moveFile(filePath, newFilePath) {
  try {
    await import_fs.promises.rename(filePath, newFilePath);
  } catch (error) {
    if (error.code === "EXDEV") {
      console.warn("\u041F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043C\u0435\u0436\u0434\u0443 \u0434\u0438\u0441\u043A\u0430\u043C\u0438, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435...");
      await import_fs.promises.copyFile(filePath, newFilePath);
      await import_fs.promises.unlink(filePath);
    } else {
      throw error;
    }
  }
}
__name(moveFile, "moveFile");

// dist/esm/utils/remove-file.js
var import_fs2 = require("fs");
async function removeFile(pathName, silent = false) {
  try {
    await import_fs2.promises.rm(pathName, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to remove ${pathName}:`, error);
    if (!silent)
      throw error;
  }
}
__name(removeFile, "removeFile");

// dist/esm/utils/format-bytes.js
function formatBytes(bytes, decimals = 2) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "0 Bytes";
  }
  const k = 1e3;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNumber = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${formattedNumber} ${sizes[i]}`;
}
__name(formatBytes, "formatBytes");

// dist/esm/utils/create-error.js
var import_js_format = require("@e22m4u/js-format");
function createError(ctor, code, message, details, ...args) {
  const msg = (0, import_js_format.format)(message, ...args);
  const error = new ctor(msg);
  Object.assign(error, { code, details });
  return error;
}
__name(createError, "createError");

// dist/esm/utils/create-directory.js
var import_fs3 = require("fs");
async function createDirectory(pathName) {
  try {
    await import_fs3.promises.mkdir(pathName, { recursive: true });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create directory.");
  }
}
__name(createDirectory, "createDirectory");

// dist/esm/local-file-uploader.js
var import_js_localizer2 = require("@e22m4u/js-localizer");

// dist/esm/thumbnail-service.js
var import_path = __toESM(require("path"), 1);
var import_sharp = __toESM(require("sharp"), 1);
var import_fs4 = require("fs");
var SUPPORTED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/svg+xml"
]);
var SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".tiff",
  ".tif",
  ".svg"
]);
var _ThumbnailService = class _ThumbnailService {
  /**
   * Определяет, можно ли создать миниатюру для файла на основе его MIME-типа
   * или расширения.
   *
   * @param fileInfo
   */
  canCreateThumbnails(fileInfo) {
    if (!fileInfo) {
      return false;
    }
    const { mimetype, extension } = fileInfo;
    if (mimetype && SUPPORTED_MIME_TYPES.has(mimetype.toLowerCase())) {
      return true;
    }
    if (extension) {
      if (SUPPORTED_EXTENSIONS.has("." + extension.toLowerCase())) {
        return true;
      }
    }
    return false;
  }
  /**
   * Создает миниатюры для изображения по заданному списку размеров.
   * Размеры используются как ограничитель самой длинной стороны изображения
   * с сохранением пропорций.
   *
   * @param sourcePath     Путь к исходному изображению.
   * @param destinationDir Папка, в которую будут сохранены миниатюры.
   * @param thumbnailSizes Массив чисел, представляющих максимальный размер длинной стороны.
   * @param options        Дополнительные опции для формата, качества и именования файлов.
   * @returns              Promise, который разрешается массивом объектов с информацией о созданных миниатюрах.
   */
  async createThumbnails(sourcePath, destinationDir, thumbnailSizes, options = {}) {
    const { format: format2 = "webp", quality = 80 } = options;
    await createDirectory(destinationDir);
    const sourceBuffer = await import_fs4.promises.readFile(sourcePath);
    const image = (0, import_sharp.default)(sourceBuffer);
    const thumbnailPromises = thumbnailSizes.map(async (size) => {
      const newFilename = `${size}.${format2}`;
      const outputPath = import_path.default.join(destinationDir, newFilename);
      const outputInfo = await image.clone().resize({
        width: size,
        height: size,
        fit: "inside",
        withoutEnlargement: true
      }).toFormat(format2, { quality }).toFile(outputPath);
      return {
        fileName: newFilename,
        path: outputPath,
        width: outputInfo.width,
        height: outputInfo.height,
        size
      };
    });
    return Promise.all(thumbnailPromises);
  }
};
__name(_ThumbnailService, "ThumbnailService");
var ThumbnailService = _ThumbnailService;

// dist/esm/debuggable-service.js
var import_js_service = require("@e22m4u/js-service");
var DEBUGGING_MODULE_NAME = "jsHttpFileUploader";
var _DebuggableService = class _DebuggableService extends import_js_service.DebuggableService {
  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container) {
    super(container, {
      namespace: DEBUGGING_MODULE_NAME,
      noEnvironmentNamespace: true
    });
  }
};
__name(_DebuggableService, "DebuggableService");
var DebuggableService = _DebuggableService;

// dist/esm/utils/get-real-file-type.js
var import_file_type = require("file-type");
async function getRealFileType(file) {
  if (!file || !file.filepath) {
    console.error("Invalid formidable File.");
    return null;
  }
  try {
    const typeInfo = await (0, import_file_type.fileTypeFromFile)(file.filepath);
    if (!typeInfo) {
      console.error("Unable to detect type of a formidable File.");
      return null;
    }
    return { mime: typeInfo.mime, ext: typeInfo.ext };
  } catch (error) {
    console.error(`Unable to detect file type of ${file.filepath}.`, error);
    return null;
  }
}
__name(getRealFileType, "getRealFileType");

// dist/esm/http-file-uploader-localizer.js
var import_js_localizer = require("@e22m4u/js-localizer");

// dist/esm/locales/en.json
var en_default = {
  "LocalFileUploader.uploadFilesFromRequest.fileUploadError": "Error occurred while file uploading.",
  "LocalFileUploader.uploadFilesFromRequest.maxFileSizeError": "The file is too large. Maximum file size is %s.",
  "LocalFileUploader.uploadFilesFromRequest.maxFilesNumberError": "Too many files. The maximum number of files is %d.",
  "LocalFileUploader.uploadFilesFromRequest.nothingToUploadError": "No files found to upload.",
  "LocalFileUploader.uploadFilesFromRequest.invalidFileError": "The file is corrupted or in an unsupported format."
};

// dist/esm/locales/ru.json
var ru_default = {
  "LocalFileUploader.uploadFilesFromRequest.fileUploadError": "\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0444\u0430\u0439\u043B\u0430.",
  "LocalFileUploader.uploadFilesFromRequest.maxFileSizeError": "\u0424\u0430\u0439\u043B \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439. \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0444\u0430\u0439\u043B\u0430 %s.",
  "LocalFileUploader.uploadFilesFromRequest.maxFilesNumberError": "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0444\u0430\u0439\u043B\u043E\u0432. \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0444\u0430\u0439\u043B\u043E\u0432 %d.",
  "LocalFileUploader.uploadFilesFromRequest.nothingToUploadError": "\u0424\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B.",
  "LocalFileUploader.uploadFilesFromRequest.invalidFileError": "\u0424\u0430\u0439\u043B \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D \u0438\u043B\u0438 \u0438\u043C\u0435\u0435\u0442 \u043D\u0435\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442."
};

// dist/esm/http-file-uploader-localizer.js
var _HttpFileUploaderLocalizer = class _HttpFileUploaderLocalizer extends import_js_localizer.Localizer {
  /**
   * Constructor.
   *
   * @param container
   * @param options
   */
  constructor(container, options) {
    super(container, {
      dictionaries: { en: en_default, ru: ru_default },
      ...options
    });
  }
};
__name(_HttpFileUploaderLocalizer, "HttpFileUploaderLocalizer");
var HttpFileUploaderLocalizer = _HttpFileUploaderLocalizer;

// dist/esm/local-file-uploader.js
var _LocalFileUploaderOptions = class _LocalFileUploaderOptions {
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
};
__name(_LocalFileUploaderOptions, "LocalFileUploaderOptions");
var LocalFileUploaderOptions = _LocalFileUploaderOptions;
var LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS = {
  targetDir: "upload",
  maxFileSize: 5 * 1e3 * 1e3,
  // 5mb
  maxFilesNumber: 10,
  createThumbnails: true,
  thumbnailSizes: [320, 640, 1024, 1920],
  thumbnailFormat: "webp",
  thumbnailQuality: 80
};
var _LocalFileUploader = class _LocalFileUploader extends DebuggableService {
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
    if (this.hasService(LocalFileUploaderOptions)) {
      const optionsService = this.getRegisteredService(LocalFileUploaderOptions);
      const definedOptions = Object.fromEntries(Object.entries(optionsService).filter(([, value]) => value != null));
      Object.assign(this.options, definedOptions);
    }
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
    const errorKeyPrefix = `${_LocalFileUploader.name}.${this.uploadFilesFromRequest.name}`;
    debug("Uploading files.");
    const form = (0, import_formidable.default)({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFiles: this.options.maxFilesNumber,
      maxFileSize: this.options.maxFileSize,
      maxTotalFileSize: 0
    });
    const createdResourceDirs = [];
    const fileDataList = [];
    const files = await new Promise((resolve2, reject) => {
      form.on("error", (err) => {
        switch (err.code) {
          // maxFiles
          case 1015: {
            return reject(createError(import_http_errors.default.PayloadTooLarge, "PAYLOAD_TOO_LARGE", localizer.t(`${errorKeyPrefix}.maxFilesNumberError`), void 0, this.options.maxFilesNumber));
          }
          // maxFileSize
          case 1016: {
            return reject(createError(import_http_errors.default.PayloadTooLarge, "PAYLOAD_TOO_LARGE", localizer.t(`${errorKeyPrefix}.maxFileSizeError`), void 0, formatBytes(this.options.maxFileSize)));
          }
          default: {
            return reject(createError(import_http_errors.default.BadRequest, "FILE_UPLOAD_FAILED", localizer.t(`${errorKeyPrefix}.fileUploadError`), { reason: err.message, errorCode: err.code }));
          }
        }
      });
      form.parse(req, (err, fields, files2) => {
        if (err)
          return;
        const uploadedFiles = files2[field] || [];
        if (!uploadedFiles.length) {
          return reject(createError(import_http_errors.default.BadRequest, "NOTHING_TO_UPLOAD", localizer.t(`${errorKeyPrefix}.nothingToUploadError`)));
        }
        resolve2(uploadedFiles);
      });
    });
    debug((0, import_js_localizer2.numWords)(files.length, "%d file received.", "%d files received."), files.length);
    files.forEach((file) => {
      debug("File %v saved to %v.", file.originalFilename, file.filepath);
    });
    try {
      for (const file of files) {
        const originalFileName = path2.basename(file.originalFilename);
        debug("Processing file %v.", originalFileName);
        debugWo1("Detecting real file type.");
        const fileType = await getRealFileType(file);
        if (!fileType) {
          throw createError(import_http_errors.default.BadRequest, "INVALID_FILE", localizer.t(`${errorKeyPrefix}.invalidFileError`));
        }
        debugWo1("Detected MIME was %v (.%s).", fileType.mime, fileType.ext);
        const resourceName = (0, import_crypto.randomBytes)(16).toString("hex");
        debugWo1("Resource name was %v.", resourceName);
        const finalFileName = `file.${fileType.ext}`;
        debugWo1("Final file name was %v.", finalFileName);
        const fileData = {
          fileName: finalFileName,
          mimeType: fileType.mime,
          originalName: originalFileName,
          bytes: file.size,
          thumbs: {}
        };
        const targetDir = path2.resolve(this.options.targetDir);
        const resourceDir = path2.resolve(targetDir, container != null ? container : "", resourceName);
        if (container && !resourceDir.startsWith(targetDir)) {
          throw createError(import_http_errors.default.BadRequest, "INVALID_CONTAINER", "Invalid container name provided.", { container });
        }
        debugWo1("Resource directory was %v.", resourceDir);
        const finalFilePath = path2.join(resourceDir, finalFileName);
        debugWo1("Final file path was %v.", finalFilePath);
        await createDirectory(resourceDir);
        debugWo1("Resource directory created.");
        createdResourceDirs.push(resourceDir);
        await moveFile(file.filepath, finalFilePath);
        if (this.options.createThumbnails && this.options.thumbnailSizes.length) {
          const canCreateThumbs = thumbnailService.canCreateThumbnails({
            mimetype: fileType.mime,
            extension: fileType.ext
          });
          if (canCreateThumbs) {
            const thumbnails = await thumbnailService.createThumbnails(finalFilePath, resourceDir, this.options.thumbnailSizes, {
              format: this.options.thumbnailFormat,
              quality: this.options.thumbnailQuality
            });
            thumbnails.forEach((thumb) => {
              fileData.thumbs[thumb.size] = thumb.fileName;
              debugWo2("Thumbnail %d created in %v.", thumb.size, thumb.path);
            });
          } else {
            debugWo1("Thumbnails not supported for %v", fileType.mime);
          }
        }
        fileDataList.push(fileData);
      }
      debug((0, import_js_localizer2.numWords)(files.length, "One file has been uploaded.", "%d files have been uploaded."), files.length);
      return fileDataList;
    } catch (error) {
      debug("An error occurred during processing.");
      debug("Cleaning up created directories.");
      await Promise.all(createdResourceDirs.map((dir) => {
        debug("Removing directory %v.", dir);
        return removeFile(dir, true);
      }));
      await Promise.all(files.map((file) => {
        debug("Removing temporary file %v.", file.filepath);
        return removeFile(file.filepath, true);
      }));
      debug("Cleanup finished.");
      throw error;
    }
  }
};
__name(_LocalFileUploader, "LocalFileUploader");
var LocalFileUploader = _LocalFileUploader;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LOCAL_FILE_UPLOADER_DEFAULT_OPTIONS,
  LocalFileUploader,
  LocalFileUploaderOptions,
  formatBytes
});
