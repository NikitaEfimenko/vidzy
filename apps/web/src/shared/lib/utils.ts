import { fileTypeEnum } from "@vidzy/database";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";
export { zodToJsonSchema } from "zod-to-json-schema";
export { jsonSchemaToZod } from "json-schema-to-zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValueByPath<T>(obj: T, path: string): unknown {
  try {
    if (!obj || typeof obj !== "object" || !path) return undefined;

    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current === null || current === undefined) return undefined;

      // Преобразуем числовые ключи (для массивов)
      const arrayKey = /^\d+$/.test(key) ? parseInt(key, 10) : key;
      
      // Проверяем существование ключа (безопасный доступ)
      if (!(arrayKey in current)) return undefined;
      
      current = current[arrayKey];
    }

    return current;
  } catch {
    return undefined; // На случай любых непредвиденных ошибок
  }
}

export const getFileTypeFromUrl = (url: string): typeof fileTypeEnum.enumValues[number] => {
  if (!url) return 'other';
  
  try {
    // Создаем URL объект для удобного парсинга
    const urlObj = new URL(url);
    // Получаем путь (pathname) и извлекаем последнюю часть после /
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Если fileName пустой (например, URL заканчивается на /)
    if (!fileName) return 'other';
    
    // Используем вашу существующую функцию
    return getFileTypeByExtension(fileName);
  } catch (e) {
    // Если URL невалидный, пытаемся извлечь имя файла вручную
    const lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex >= 0 && lastSlashIndex < url.length - 1) {
      const fileName = url.slice(lastSlashIndex + 1).split('?')[0].split('#')[0];
      return getFileTypeByExtension(fileName);
    }
    return 'other';
  }
};

export const getFileTypeByExtension = (fileName: string): typeof fileTypeEnum.enumValues[number] => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'music';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'video';
    case 'srt':
      return 'srt';
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'png':
    case 'gif':
      return 'image';
    default:
      return 'other';
  }
};

export function generateDataUrl(file: File, callback: (imageUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

export const getInitDataFromUrl = (): string | null => {
  if (typeof window !== "undefined") {
    let initData = (window as any)?.Telegram?.WebApp?.initData;

    if (!initData) {
      const params = new URLSearchParams(window.location.search);
      initData = params.get('initData');
      
      if (initData) {
        initData = decodeURIComponent(initData);
      }
    }

    return initData;
  }
  
  // Возвращаем null, если код выполняется на сервере
  return null;
};

export const extendWithInitData = (url: string): string => {
  if (typeof window !== "undefined") {
    const webapp = (window as any)?.Telegram?.WebApp;
    let initData = webapp?.initData;
    console.log(initData, "from extendWithInitData")
    if (initData) {
      const encodedInitData = encodeURIComponent(initData);
      const urlObj = new URL(url);
      urlObj.searchParams.set('initData', encodedInitData);
      return urlObj.toString();
    }
  }

  // Возвращаем оригинальный URL, если код выполняется на сервере или нет initData
  return url;
};


export function objectToZodSchema(obj: Record<string, any>): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Преобразуем значение в строку для описания
      const description = `Example: ${value.toString()}`;

      // Определяем тип значения и создаем соответствующую Zod-схему
      if (typeof value === 'string') {
        schemaShape[key] = z.string().describe(description);
      } else if (typeof value === 'number') {
        schemaShape[key] = z.number().describe(description);
      } else if (typeof value === 'boolean') {
        schemaShape[key] = z.boolean().describe(description);
      } else if (Array.isArray(value)) {
        // Если значение — массив, проверяем тип его элементов
        if (value.length > 0) {
          const firstElement = value[0];
          if (typeof firstElement === 'string') {
            schemaShape[key] = z.array(z.string()).describe(description);
          } else if (typeof firstElement === 'number') {
            schemaShape[key] = z.array(z.number()).describe(description);
          } else if (typeof firstElement === 'boolean') {
            schemaShape[key] = z.array(z.boolean()).describe(description);
          } else {
            // Если тип элемента массива неизвестен, используем z.any()
            schemaShape[key] = z.array(z.any()).describe(description);
          }
        } else {
          // Если массив пустой, используем z.array(z.any())
          schemaShape[key] = z.array(z.any()).describe(description);
        }
      } else if (value && typeof value === 'object') {
        // Если значение — объект, рекурсивно создаем схему для него
        schemaShape[key] = objectToZodSchema(value).describe(description);
      } else {
        // Если тип неизвестен, используем z.any()
        schemaShape[key] = z.any().describe(description);
      }
    }
  }

  return z.object(schemaShape);
}
