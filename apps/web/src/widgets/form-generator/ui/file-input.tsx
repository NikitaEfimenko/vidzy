import React, { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/input'; // Предположим, что это ваш компонент Input
import { FilePreview } from '@/shared/ui/file-preview'; // Предположим, что это ваш компонент FilePreview
import { generateDataUrl, getFileTypeByExtension } from '@/shared/lib/utils';
import { fileTypeEnum } from '@vidzy/database';

interface FileInputProps {
  name: string;
  register: any;
  errors: any;
}

const FileInput: React.FC<FileInputProps> = ({ name, register, errors }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<typeof fileTypeEnum.enumValues[number]>('other');


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateDataUrl(file, setDataUrl);
      const type = getFileTypeByExtension(file.name);
      setFileType(type);
    }
  };

  const elems = register(name) ?? {};

  return (
    <div key={name}>
      <label>{name}</label>
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
            elems?.onChange?.(file);
          }
        }}
      />
      {errors[name] && <p>{errors[name].message}</p>}
    </div>
  );
};

export default FileInput;