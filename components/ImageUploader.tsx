
import React, { useState, useCallback } from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface ImageUploaderProps {
  onUpload: (imageDataUrl: string, file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Please select an image under 5MB.");
        setPreview(null);
        setFile(null);
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError("Invalid file type. Please select an image.");
        setPreview(null);
        setFile(null);
        return;
      }

      setError(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
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
  };

  const handleSubmit = () => {
    if (preview && file) {
      onUpload(preview, file);
      setPreview(null);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1 w-full">
        <label
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <PlusIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, or WEBP (MAX. 5MB)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleInputChange} />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      {preview && (
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md">
            <img src={preview} alt="Image preview" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-brand-accent text-white font-semibold py-2 px-6 rounded-md hover:bg-brand-accent-hover transition-colors"
          >
            Analyze & Add
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
