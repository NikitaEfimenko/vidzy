'use client'
import React, { useActionState } from 'react';
import { usePolling } from '@/shared/hooks/use-polling';
import { Button } from '@/shared/ui/button';
import Image from 'next/image';
import { uploadAttachmentAction } from '@/entities/attachments/api/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader } from 'lucide-react';

// Тип для данных, возвращаемых API
type ImageGenerationResponse = {
  id: string;
  done: boolean;
  response: {
    image: string; // base64 изображения
  };
};

const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  // Удаляем префикс Data URL (если он есть)
  const base64WithoutPrefix = base64.split(';base64,').pop() || base64;

  // Декодируем base64 в бинарные данные
  const byteCharacters = atob(base64WithoutPrefix);
  const byteArrays = [];

  // Преобразуем бинарные данные в массив байтов
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // Создаем Blob из массива байтов
  const blob = new Blob(byteArrays, { type: mimeType });

  // Создаем File из Blob
  return new File([blob], filename, { type: mimeType });
};

export const configureUrl = (requestId: string) => `${process.env.NEXT_PUBLIC_RENDERER_HOST}/llm/check-image-status?requestId=${requestId}`;

// Компонент для генерации изображения
export const AIImagePreview: React.FC<{ requestId: string }> = ({ requestId }) => {
  // URL для опроса
  const url = configureUrl(requestId)

  // Функция для выполнения запроса
  const fetcher = async (url: string): Promise<ImageGenerationResponse> => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error('Ошибка при запросе к API');
    }
    return response.json();
  };

  // Используем хук usePolling
  const { data, error, isLoading } = usePolling<ImageGenerationResponse>(url, fetcher, 3000);

  const imageSrc = data?.response?.image ? `data:image/jpeg;base64,${data?.response?.image}` : null;

  const [state, formAction] = useFormState(uploadAttachmentAction.bind(null, true), {
    isSuccess: false,
    url: null,
  });


  const handleSubmit = async () => {
    const formData = new FormData();
    if (data?.done) {
      // Преобразуем base64 в File
      const file = base64ToFile(data.response.image, 'image.jpg', 'image/jpeg');
      formData.append('file', file);
      formData.append('fileType', 'image');

      formAction(formData);
    }
  };

  const { pending } = useFormStatus()


  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col gap-3'>
      {data?.done && data.response.image ? <>
        <div className='relative overflow-hidden' style={{height: 240}}>
          {imageSrc ? <Image className="absolute inset-0 w-full h-full" fill src={imageSrc} alt="Generated" /> : <Loader className="animate-spin"/>}
        </div>
        <form action={handleSubmit}>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </> : (
        <div className='flex items-center justify-center'>
          <Loader className="animate-spin"></Loader>
        </div>
      )}
    </div>
  );
};