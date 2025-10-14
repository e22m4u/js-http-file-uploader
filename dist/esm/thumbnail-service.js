import path from 'path';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { createDirectory } from './utils/index.js';
/**
 * Список MIME-типов изображений, для которых обычно можно создать миниатюру.
 * Этот список можно расширить в зависимости от используемой библиотеки
 * (например, Sharp.js).
 */
const SUPPORTED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/tiff',
    'image/svg+xml',
]);
/**
 * Список расширений файлов, которые соответствуют поддерживаемым форматам.
 * Используется как запасной вариант, если MIME-тип недоступен.
 */
const SUPPORTED_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.avif',
    '.tiff',
    '.tif',
    '.svg',
]);
/**
 * Thumbnail service.
 */
export class ThumbnailService {
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
            if (SUPPORTED_EXTENSIONS.has('.' + extension.toLowerCase())) {
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
        // установка значений по умолчанию
        const { format = 'webp', quality = 80 } = options;
        // создание директории назначения при ее отсутствии
        await createDirectory(destinationDir);
        const sourceBuffer = await fs.readFile(sourcePath);
        const image = sharp(sourceBuffer);
        // создание Promise для каждой задачи по изменению размера
        const thumbnailPromises = thumbnailSizes.map(async (size) => {
            // генерация имени для нового файла, например: my-image-300.webp
            const newFilename = `${size}.${format}`;
            const outputPath = path.join(destinationDir, newFilename);
            // Использование библиотеки sharp для изменения размера.
            //   fit: 'inside'
            //     - гарантирует, что изображение вписывается в квадрат size x size,
            //       сохраняя пропорции. Это автоматически ограничивает самую длинную
            //       сторону.
            //   withoutEnlargement: true
            //     - предотвращает увеличение маленьких изображений.
            const outputInfo = await image
                .clone() // клонирование объекта, чтобы не изменять исходный для других размеров
                .resize({
                width: size,
                height: size,
                fit: 'inside',
                withoutEnlargement: true,
            })
                .toFormat(format, { quality })
                .toFile(outputPath);
            return {
                fileName: newFilename,
                path: outputPath,
                width: outputInfo.width,
                height: outputInfo.height,
                size: size,
            };
        });
        // параллельное выполнение всех задач и возврат результата.
        return Promise.all(thumbnailPromises);
    }
}
