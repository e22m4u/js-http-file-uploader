import {fileTypeFromFile} from 'file-type';
import type {File as FormidableFile} from 'formidable';

/**
 * Определяет реальный MIME-тип и расширение файла, анализируя его содержимое.
 * Это надежный способ проверки, в отличие от доверчивого использования
 * file.mimetype, который присылается клиентом.
 *
 * @param file Объект файла, полученный от formidable после загрузки.
 * @returns Promise, который разрешается объектом {mime: string, ext: string}.
 */
export async function getRealFileType(
  file: FormidableFile,
): Promise<{mime: string; ext: string} | null> {
  // 1. Проверка на наличие файла и пути к нему
  if (!file || !file.filepath) {
    console.error('Invalid formidable File.');
    return null;
  }
  try {
    const typeInfo = await fileTypeFromFile(file.filepath);
    if (!typeInfo) {
      console.error('Unable to detect type of a formidable File.');
      return null;
    }
    // 4. Возвращаем результат
    return {mime: typeInfo.mime, ext: typeInfo.ext};
  } catch (error) {
    console.error(`Unable to detect file type of ${file.filepath}.`, error);
    return null;
  }
}
