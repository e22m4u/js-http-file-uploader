import type { File as FormidableFile } from 'formidable';
/**
 * Определяет реальный MIME-тип и расширение файла, анализируя его содержимое.
 * Это надежный способ проверки, в отличие от доверчивого использования
 * file.mimetype, который присылается клиентом.
 *
 * @param file Объект файла, полученный от formidable после загрузки.
 * @returns Promise, который разрешается объектом {mime: string, ext: string}.
 */
export declare function getRealFileType(file: FormidableFile): Promise<{
    mime: string;
    ext: string;
} | null>;
