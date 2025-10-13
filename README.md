## @e22m4u/js-http-file-uploader

Подключаемый сервис загрузки файлов для JavaScript.

Модуль предоставляет механизм для обработки `multipart/form-data` запросов,
сохранения файлов в локальной файловой системе и создания миниатюр
для изображений. Он может использоваться как самостоятельный инструмент
или быть интегрирован в
[сервис-контейнер](https://www.npmjs.com/package/@e22m4u/js-service).

## Оглавление

- [Установка](#установка)
- [Использование](#использование)
  - [Базовый пример](#базовый-пример)
  - [Использование с сервис-контейнером](#использование-с-сервис-контейнером)
  - [Структура хранения файлов](#структура-хранения-файлов)
  - [Обработка ошибок](#обработка-ошибок)
- [API](#api)
  - [LocalFileUploader](#localfileuploader)
    - [Конструктор](#конструктор)
    - [uploadFilesFromRequest](#localfileuploaderuploadfilesfromrequest)
  - [LocalFileUploaderOptions](#localfileuploaderoptions)
  - [FileData (Тип возвращаемых данных)](#filedata-тип-возвращаемых-данных)
  - [formatBytes](#formatbytes)
- [Локализация](#локализация)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-http-file-uploader
```

Модуль поддерживает ESM и CommonJS стандарты.

*ESM*

```js
import {LocalFileUploader} from '@e22m4u/js-http-file-uploader';
```

*CommonJS*

```js
const {LocalFileUploader} = require('@e22m4u/js-http-file-uploader');
```

## Использование

### Базовый пример

В этом примере `LocalFileUploader` используется без сервис-контейнера.
Настройки передаются напрямую в конструктор.

```js
import * as http from 'http';
import {LocalFileUploader} from '@e22m4u/js-http-file-uploader';

// Создание экземпляра загрузчика с пользовательскими настройками
const uploader = new LocalFileUploader(undefined, {
  targetDir: './public/uploads', // Директория для сохранения файлов
  maxFileSize: 10 * 1000 * 1000, // 10 MB
  createThumbnails: true,        // Включить создание миниатюр
});

const server = http.createServer(async (req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    try {
      // Загрузка файлов из поля 'myFiles'
      // Третий аргумент 'user-content' - это опциональный подкаталог (контейнер)
      const filesData = await uploader.uploadFilesFromRequest(
        req,
        'myFiles',
        'user-content',
      );
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        message: 'Files uploaded successfully!',
        files: filesData,
      }));
    } catch (error) {
      const statusCode = error.status || 500;
      res.writeHead(statusCode, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        error: {
          message: error.message,
          code: error.code,
        },
      }));
    }
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
```

### Использование с сервис-контейнером

`LocalFileUploader` может быть интегрирован с `@e22m4u/js-service`
для централизованного управления конфигурацией и зависимостями.

```js
import {ServiceContainer} from '@e22m4u/js-service';

import {
  LocalFileUploader,
  LocalFileUploaderOptions,
} from '@e22m4u/js-http-file-uploader';

// Создание сервис-контейнера
const app = new ServiceContainer();

// Регистрация настроек как отдельного сервиса
app.use(LocalFileUploaderOptions, {
  targetDir: './storage/media',
  maxFileSize: 5 * 1000 * 1000, // 5 MB
  maxFilesNumber: 5,
  createThumbnails: true,
  thumbnailSizes: [150, 480, 1280],
  thumbnailQuality: 75,
});

// ... в обработчике HTTP-запроса ...

async function handleUpload(req) {
  // Получение экземпляра LocalFileUploader из контейнера.
  // Настройки будут автоматически применены из LocalFileUploaderOptions.
  const uploader = app.get(LocalFileUploader);

  // Дальнейшая логика аналогична базовому примеру
  const filesData = await uploader.uploadFilesFromRequest(req, 'galleryImages');
  return filesData;
}
```

### Структура хранения файлов

Каждый загруженный файл сохраняется в собственную уникальную директорию.
Это позволяет избежать конфликтов имен и удобно хранить связанные ресурсы
(оригинал и миниатюры).

Предположим, что `targetDir` установлен в `'./public/uploads'`,
а `container` в `'avatars'`, тогда загружаемый файл может храниться
следующим образом.

```
./public/uploads/
└── avatars/
    └── c7f8a9b1d2e3f4a5b6c7d8e9f0a1b2c3/  <-- Уникальная директория ресурса
        ├── file.jpeg                      <-- Оригинальный файл
        ├── 320.webp                       <-- Миниатюра 320px
        └── 640.webp                       <-- Миниатюра 640px
```

Путь к оригинальному файлу будет:  
`public/uploads/avatars/c7f8a9b1d2e3f4a5b6c7d8e9f0a1b2c3/file.jpeg`

### Обработка ошибок

Метод `uploadFilesFromRequest` выбрасывает ошибки, совместимые
с пакетом `http-errors`. Это позволяет легко интегрировать обработку
ошибок в веб-фреймворки. Каждая ошибка содержит стандартные
поля `status` (HTTP-статус) и `message`, а также дополнительные
поля `code` (код ошибки) и `details` (дополнительная информация).

```js
// ...
try {
  const filesData = await uploader.uploadFilesFromRequest(req, 'myFiles');
  // ...
} catch (error) {
  // error.status будет содержать подходящий HTTP-код,
  // например, 400 (Bad Request) или 413 (Payload Too Large)
  console.error({
    status: error.status,   // e.g., 413
    message: error.message, // e.g., "Файл слишком большой. Максимальный размер файла 5 MB."
    code: error.code,       // e.g., "PAYLOAD_TOO_LARGE"
    details: error.details, // e.g., {reason: 'maxFileSize exceeded'}
  });
  // Отправка ответа клиенту
  res.writeHead(error.status || 500).end(error.message);
}
```

## API

### LocalFileUploader

Класс, предоставляющий функциональность для загрузки файлов в локальное
хранилище. Наследуется от `DebuggableService` из пакета `@e22m4u/js-service`.

#### Конструктор

Создает новый экземпляр загрузчика.

**Сигнатура**

```ts
constructor(
  container?: ServiceContainer,
  options?: LocalFileUploaderOptions,
)
```

**Параметры**

- `container` (опционально)  
  Экземпляр `ServiceContainer`. Если предоставлен, загрузчик сможет
  взаимодействовать с другими сервисами и получать свою конфигурацию
  из `LocalFileUploaderOptions`, зарегистрированного в контейнере.
- `options` (опционально)  
  Объект [LocalFileUploaderOptions](#localfileuploaderoptions) для настройки
  экземпляра. Эти настройки имеют наивысший приоритет, переопределяя значения
  по умолчанию и те, что получены из сервис-контейнера.

#### localFileUploader.uploadFilesFromRequest

Обрабатывает входящий HTTP-запрос, извлекает файлы из указанного поля формы,
сохраняет их и создает миниатюры.

**Сигнатура**

```ts
async uploadFilesFromRequest(
  req: IncomingMessage,
  field: string,
  container?: string,
): Promise<FileData[]>
```

**Параметры**

- `req`  
  Объект входящего запроса Node.js (`http.IncomingMessage`).
- `field`  
  Имя поля (`<input type="file" name="fieldName">`) в `multipart/form-data`,
  из которого нужно извлечь файлы.
- `container` (опционально)  
  Строка, представляющая имя поддиректории внутри `targetDir`. Используется
  для группировки связанных файлов, например, по ID пользователя или сущности.

**Возвращает**

`Promise`, который разрешается массивом объектов
[FileData](#filedata-тип-возвращаемых-данных),
по одному объекту на каждый успешно загруженный файл.
В случае ошибки `Promise` будет отклонен с ошибкой `http-errors`.

**Процесс выполнения**

1. Парсинг `multipart/form-data` с помощью `formidable`.
2. Применение ограничений на размер и количество файлов.
3. Для каждого файла:
    - Определение реального MIME-типа по содержимому файла для безопасности.
    - Генерация уникального 32-символьного имени для **директории ресурса**.
    - Создание целевой директории (`targetDir/container/resourceName`).
    - Перемещение временного файла в целевую директорию с именем `file.<ext>`.
    - Если включено, создание миниатюр для изображений с помощью `sharp`.
    - Формирование объекта `FileData` с результатами.
4. В случае любой ошибки на любом из этапов, все созданные файлы и директории
  для текущего запроса будут автоматически удалены.

### LocalFileUploaderOptions

Класс-контейнер для настроек загрузчика. Его экземпляр можно передать
в конструктор или зарегистрировать в сервис-контейнере.

- `targetDir`  
  (тип: `string`, по умолчанию: `'upload'`)  
  Корневая директория для сохранения всех загруженных файлов.

- `maxFileSize`  
  (тип: `number`, по умолчанию: `5242880` (5 MB))  
  Максимальный размер одного файла в байтах.

- `maxFilesNumber`  
  (тип: `number`, по умолчанию: `10`)  
  Максимальное количество файлов в одном запросе.

- `createThumbnails`  
  (тип: `boolean`, по умолчанию: `true`)  
  Если `true`, для поддерживаемых форматов изображений будут созданы миниатюры.

- `thumbnailSizes`  
  (тип: `number[]`, по умолчанию: `[320, 640, 1024, 1920]`)  
  Массив ширин в пикселях для создаваемых миниатюр. Пропорции изображения сохраняются.

- `thumbnailFormat`  
  (тип: `'jpeg' | 'png' | 'webp' | 'avif'`, по умолчанию: `'webp'`)  
  Формат для сгенерированных миниатюр.

- `thumbnailQuality`  
  (тип: `number`, по умолчанию: `80`)  
  Качество сжатия для форматов `jpeg`, `webp`, `avif` (от 1 до 100).

### FileData (Тип возвращаемых данных)

Объект, содержащий информацию о загруженном файле.
Метод `uploadFilesFromRequest` возвращает массив таких объектов.

**Структура**

```ts
type FileData = {
  name?: string;
  mime?: string;
  originalName?: string;
  bytes?: number;
  thumbs?: Record<string, string>;
}
```

- `name`  
  (тип: `string`)  
  Статичное имя основного файла (например, `file.jpeg`). Уникальность
  обеспечивается родительской директорией.

- `mime`  
  (тип: `string`)  
  MIME-тип файла, определенный на основе его содержимого (например, `image/webp`).

- `originalName`  
  (тип: `string`)  
  Исходное имя файла, переданное клиентом (например, `my-photo.jpg`).

- `bytes`  
  (тип: `number`)  
  Размер файла в байтах.

- `thumbs`  
  (тип: `Record<string, string>`)  
  Объект, где ключи - это размеры миниатюр (из `thumbnailSizes`),
  а значения - имена файлов (например, `{"320": "320.webp"}`).

### formatBytes

Вспомогательная функция для форматирования размера файла
в человеко-читаемый вид (KB, MB, GB).

**Сигнатура**

```ts
function formatBytes(bytes: number, decimals = 2): string
```

**Пример**

```js
import {formatBytes} from '@e22m4u/js-http-file-uploader';

console.log(formatBytes(1234567));    // "1.23 MB"
console.log(formatBytes(5242880, 0)); // "5 MB"
```

## Локализация

Сообщения об ошибках, возвращаемые библиотекой, локализованы.
Встроенная поддержка включает русский (`ru`) и английский (`en`) языки.
Локаль определяется автоматически на основе заголовка `Accept-Language`
входящего HTTP-запроса. Это реализовано с помощью
класса `HttpFileUploaderLocalizer`,
который является расширением `@e22m4u/js-localizer`.

## Тесты

```bash
npm run test
```

## Лицензия

MIT