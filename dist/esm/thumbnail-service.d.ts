/**
 * Thumbnail format.
 */
export type ThumbnailFormat = 'jpeg' | 'png' | 'webp' | 'avif';
/**
 * Опции для создания миниатюр.
 */
interface ThumbnailOptions {
    /**
     * Формат выходного файла.
     * По умолчанию 'webp'.
     */
    format?: ThumbnailFormat;
    /**
     * Качество для сжатых форматов (1-100).
     * По умолчанию 80.
     */
    quality?: number;
}
/**
 * Результат создания одной миниатюры.
 */
export interface ThumbnailResult {
    /**
     * Имя файла.
     */
    fileName: string;
    /**
     * Путь к созданному файлу миниатюры.
     */
    path: string;
    /**
     * Ширина миниатюры в пикселях.
     */
    width: number;
    /**
     * Высота миниатюры в пикселях.
     */
    height: number;
    /**
     * Размер, который использовался как ограничение.
     */
    size: number;
}
/**
 * Thumbnail service.
 */
export declare class ThumbnailService {
    /**
     * Определяет, можно ли создать миниатюру для файла на основе его MIME-типа
     * или расширения.
     *
     * @param fileInfo
     */
    canCreateThumbnails(fileInfo: {
        mimetype?: string;
        extension?: string;
    }): boolean;
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
    createThumbnails(sourcePath: string, destinationDir: string, thumbnailSizes: number[], options?: ThumbnailOptions): Promise<ThumbnailResult[]>;
}
export {};
