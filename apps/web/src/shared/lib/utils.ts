import { fileTypeEnum } from "@vidzy/database";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

