import { promises as fs } from 'fs';
/**
 * Move file.
 */
export async function moveFile(filePath, newFilePath) {
    try {
        await fs.rename(filePath, newFilePath);
    }
    catch (error) {
        if (error.code === 'EXDEV') {
            // Если это ошибка перемещения между дисками, используем копирование
            console.warn('Перемещение между дисками, используем копирование...');
            await fs.copyFile(filePath, newFilePath);
            await fs.unlink(filePath); // Не забываем удалить оригинал
        }
        else {
            // Обрабатываем другие ошибки
            throw error;
        }
    }
}
