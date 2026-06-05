import { useRef, useState } from 'react';

const MAX_SIZE_MB = 5;

interface AvatarUploadProps {
  avatarPreview: string | null;
  nome: string;
  onFileSelect: (file: File) => void;
}

export function AvatarUpload({ avatarPreview, nome, onFileSelect }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSizeError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSizeError('');
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-32 h-32 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl text-muted-foreground">{nome.charAt(0).toUpperCase()}</span>
        )}
        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
          <span className="text-white text-sm font-semibold">Alterar Foto</span>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-sm text-primary font-medium hover:underline bg-transparent border-none cursor-pointer"
      >
        Escolher nova foto
      </button>
      {sizeError && (
        <p className="text-xs text-destructive text-center">{sizeError}</p>
      )}
    </div>
  );
}
