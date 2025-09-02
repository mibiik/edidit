import React, { useCallback, useRef } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';

type InputImage = {
  data: string;
  mimeType: string;
  name: string;
};

interface ImageInputProps {
  image: InputImage | null;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ image, onImageUpload, onRemoveImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  if (image) {
    return (
      <div className="relative group w-full">
        <img
          src={`data:${image.mimeType};base64,${image.data}`}
          alt="Input preview"
          className="w-full h-auto object-cover rounded-lg border-2 border-gray-700"
        />
        <button
          onClick={onRemoveImage}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-600/90 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Remove image"
        >
          <XCircleIcon />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg truncate">
          {image.name}
        </div>
      </div>
    );
  }

  return (
    <>
      <label
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex justify-center items-center w-full h-48 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#0D1117] hover:bg-gray-900/60 transition-colors"
      >
        <div className="text-center">
          <UploadIcon />
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-600">PNG, JPG or WEBP</p>
        </div>
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </>
  );
};