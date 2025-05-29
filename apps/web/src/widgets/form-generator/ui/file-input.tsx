'use client'

import { generateDataUrl, getFileTypeByExtension } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { FilePreview } from '@/shared/ui/file-preview'; // Предположим, что это ваш компонент FilePreview
import { FormAction } from '@/shared/ui/form-action';
import { Input } from '@/shared/ui/input'; // Предположим, что это ваш компонент Input
import { fileTypeEnum } from '@vidzy/database';
import { FilesIcon } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileSelector } from './file-selector';
import Link from 'next/link';
import { FaMagic } from 'react-icons/fa';
import { AttachmentsModelType } from '@/entities/attachments/dto/model';

interface FileInputProps {
  name: string;
  register: any;
  errors: any;
  defaultValue?: any
}

export const FileInput: React.FC<FileInputProps> = ({ name, register, errors }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<typeof fileTypeEnum.enumValues[number]>('other');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateDataUrl(file, setDataUrl);
      const type = getFileTypeByExtension(file.name);
      setFileType(type);
    }
  };

  const elems = register?.(name) ?? {};

  const handleSelectAttachment = async (attachment: AttachmentsModelType) => {
    if (typeof window === 'undefined') return;
    if (attachment?.fileUrl) {
      try {
        const response = await fetch(attachment.fileUrl);
        const blob = await response.blob();
        const file = new File([blob], attachment.fileName, { type: blob.type });

        generateDataUrl(file, setDataUrl);
        setFileType(getFileTypeByExtension(attachment.fileName));

        if (fileInput.current) {
          // Создаём новый FileList
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.current.files = dataTransfer.files;
  
          // Вызываем onChange, имитируя событие
          const fakeEvent = {
            target: fileInput.current,
          };
          elems?.onChange?.(fakeEvent);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <FormAction
        title={
          <div className='flex gap-4 items-center'>
            <span> Select your files</span>
            <Link href="/attachments">
              <Button size="sm" type="button"><FaMagic />Generate your own</Button>
            </Link>
          </div>}
        description=""
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        className="md:max-w-6xl"
        ctaSlot={<Button><FilesIcon />Select from attachments</Button>}
        formSlot={<FileSelector
          withCaption={false}
          withRemove={false}
          withCurrentUser
          handleSelect={handleSelectAttachment}
        />}
        formControls={<></>}
      />
      <FilePreview
        fileType={fileType}
        fileUrl={dataUrl ?? undefined}
        onClick={() => fileInput.current?.click()}
      />
      <Input
        className="hidden"
        type="file"
        placeholder=""
        {...elems}
        ref={fileInput}
        onChange={(e) => {
          handleFileChange(e);
          const file = e.target.files?.[0];
          if (file && elems?.onChange) {
            const fakeEvent = {
              target: {
                value: file,
                name: elems.name
              },
            };
            elems?.onChange?.(fakeEvent);
          }
        }}
      />
      {errors[name] && <p>{errors[name].message}</p>}
    </div>
  );
};


export const FileInputUrl: React.FC<FileInputProps> = ({ defaultValue, name, register, errors }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(() => {
    return defaultValue ?? null
  })
  const [fileType, setFileType] = useState<typeof fileTypeEnum.enumValues[number]>();
  const elems = register?.(name) ?? {}

  useEffect(() => {
    if (!dataUrl && defaultValue) {
      setDataUrl(defaultValue ?? null)
    }
  }, [defaultValue, dataUrl])

  const [isDialogOpen, setIsDialogOpen] = useState(false);


  return (
    <div>
      <div className='flex items-center justify-between'>
        <label>{name}</label>
        <FormAction
          title={
            <div className='flex gap-4 items-center'>
              <span> Select your files</span>
              <Link href="/attachments">
                <Button size="sm" type="button"><FaMagic />Generate your own</Button>
              </Link>
            </div>}
          description=""
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          className="md:max-w-6xl"
          ctaSlot={<Button><FilesIcon />Select from attachments</Button>}
          formSlot={<FileSelector
            withCaption={false}
            withRemove={false}
            withCurrentUser
            handleSelect={attachment => {
              if (attachment && attachment.fileUrl) {
                setFileType(getFileTypeByExtension(attachment.fileName))
                setDataUrl(attachment.fileUrl)
                if (elems && elems?.onChange) {
                  const fakeEvent = {
                    target: {
                      value: attachment.fileUrl,
                      name: elems.name || "fileUrl",
                    },
                  };
                  elems?.onChange?.(fakeEvent);
                }
                setIsDialogOpen(false);
              }
            }}
          />}
          formControls={<></>}
        />
      </div>
      <FilePreview
        fileType={fileType}
        fileUrl={dataUrl ?? elems?.value}
        asUrl={true}
      />
      <Input
        type="url"
        className="hidden"
        placeholder=""
        {...elems}
      />
      {errors[name] && <p>{errors[name].message}</p>}
    </div>
  );
};
