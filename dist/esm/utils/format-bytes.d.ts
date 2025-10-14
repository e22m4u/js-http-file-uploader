/**
 * Форматирует байты в человеко-читаемый вид (KB, MB, GB).
 * Использует десятичную систему (1 KB = 1000 Bytes).
 *
 * Примеры использования
 *   console.log(formatBytes(0));             // "0 Bytes"
 *   console.log(formatBytes(1024));          // "1.02 KB"
 *   console.log(formatBytes(12345));         // "12.35 KB"
 *   console.log(formatBytes(1234567));       // "1.23 MB"
 *   console.log(formatBytes(1234567890));    // "1.23 GB"
 *   console.log(formatBytes(1099511627776)); // "1.1 TB"

 * Пример с одним знаком после запятой
 *   console.log(formatBytes(1500000, 1)); // "1.5 MB"
 *
 * Пример без дробной части
 *   console.log(formatBytes(2000000, 0)); // "2 MB"
 *
 * @param bytes    Количество байт.
 * @param decimals Количество знаков после запятой (по умолчанию 2).
 * @returns        Отформатированная строка.
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
