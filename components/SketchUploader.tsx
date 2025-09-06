import React, { useState, useCallback } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';

interface SketchUploaderProps {
  onUpload: (imageDataUrl: string, file: File) => void;
  onRemove: () => void;
}

const SketchUploader: React.FC<SketchUploaderProps> = ({ onUpload, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit for sketches
        setError("Image must be under 2MB.");
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError("Please select an image file.");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result, selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [onUpload]);
  
  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onRemove();
  }

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
   const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  if (preview) {
    return (
        <div className="relative w-full h-28">
            <img src={preview} alt="Sketch preview" className="w-full h-full object-contain rounded-lg border border-gray-300" />
            <button
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 text-gray-700 hover:bg-opacity-100 hover:text-black transition-all"
                aria-label="Remove sketch"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
  }

  return (
    <div>
        <label
            htmlFor="sketch-upload"
            className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging ? 'border-brand-accent bg-violet-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="flex flex-col items-center justify-center">
                <PlusIcon className="w-8 h-8 mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">
                    <span className="font-semibold">Click or drag</span> sketch here
                </p>
            </div>
            <input id="sketch-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleInputChange} />
        </label>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default SketchUploader;
