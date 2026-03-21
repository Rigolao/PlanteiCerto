import { useCallback, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadProps {
  currentUrl: string | null;
  onFileSelect: (file: File | null) => void;
  previewFile: File | null;
}

export function ImageUpload({ currentUrl, onFileSelect, previewFile }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = previewFile ? URL.createObjectURL(previewFile) : currentUrl;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
  };

  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Foto</label>
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 rounded-lg object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center border-none cursor-pointer shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {dragOver ? (
            <Image size={24} className="text-primary mb-2" />
          ) : (
            <Upload size={24} className="text-muted-foreground mb-2" />
          )}
          <span className="text-xs text-muted-foreground">
            Arraste uma imagem ou clique para selecionar
          </span>
        </label>
      )}
    </div>
  );
}
