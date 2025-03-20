'use client'
import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

// Тип для данных, возвращаемых хуком
type PollingResult<T> = {
  data: T | null; // Данные, полученные от API
  error: Error | null; // Ошибка, если она возникла
  isLoading: boolean; // Флаг загрузки
};

// Тип для функции fetcher
type Fetcher<T> = (url: string) => Promise<T>;

// Универсальный хук для опроса API
export const usePolling = <T,>(
  url: string | null, // URL для запроса (может быть null, чтобы отключить опрос)
  fetcher: Fetcher<T>, // Функция для выполнения запроса
  interval: number, // Интервал опроса в миллисекундах
  options?: SWRConfiguration, // Дополнительные опции для SWR
): PollingResult<T> => {
  const [isLoading, setIsLoading] = useState(true);

  // Используем useSWR для периодического запроса
  const { data, error } = useSWR<T>(url, fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: false, // Отключаем повторный запрос при фокусе окна
    ...options, // Передаем дополнительные опции
  });

  // Устанавливаем флаг загрузки
  useEffect(() => {
    if (data || error) {
      setIsLoading(false);
    }
  }, [data, error]);

  return {
    data: data || null,
    error: error || null,
    isLoading,
  };
};
