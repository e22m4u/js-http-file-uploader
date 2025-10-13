import {promises as fs} from 'fs';

/**
 * Move file.
 */
export async function moveFile(filePath: string, newFilePath: string): Promise<void> {
  try {
    await fs.rename(filePath, newFilePath);
  } catch (error) {
    if ((error as Record<string, unknown>).code === 'EXDEV') {
      // Если это ошибка перемещения между дисками, используем копирование
      console.warn('Перемещение между дисками, используем копирование...');
      await fs.copyFile(filePath, newFilePath);
      await fs.unlink(filePath); // Не забываем удалить оригинал
    } else {
      // Обрабатываем другие ошибки
      throw error;
    }
  }
}