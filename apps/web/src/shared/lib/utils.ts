import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

