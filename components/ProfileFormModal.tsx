import { useState } from 'react';
import { logger } from '@/lib/logger';

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileData) => void;
  walletAddress: string;
}

export interface ProfileData {
  displayName: string;
  twitter: string;
  telegram: string;
  profileImage: string | null;
}

export default function ProfileFormModal({ isOpen, onClose, onSubmit, walletAddress }: ProfileFormModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    twitter: '',
    telegram: '',
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    setIsUploading(true);

    try {
      // Convertir a base64 para preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir a tu servidor o servicio (ejemplo con FormData)
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('walletAddress', walletAddress);

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, profileImage: data.imageUrl });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      logger.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🎨 Customize Your Card
          </h2>
          <p className="text-gray-400 text-sm">
            Add your info to make your card unique
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center">
            <label className="text-gray-300 text-sm font-medium mb-3">
              Profile Picture
            </label>
            
            <div className="relative">
              {/* Preview circle */}
              <div className="w-32 h-32 rounded-full border-4 border-cyan-500/50 overflow-hidden bg-gray-800 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-xs">Upload</div>
                  </div>
                )}
              </div>

              {/* Upload button overlay */}
              <label
                htmlFor="profile-image"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition cursor-pointer"
              >
                <span className="text-white text-sm font-medium">
                  {isUploading ? 'Uploading...' : 'Change'}
                </span>
              </label>

              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Max 2MB • JPG, PNG, GIF
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Display Name *
            </label>
            <input
              type="text"
              placeholder="Your name or nickname"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
              maxLength={30}
              required
            />
          </div>

          {/* Twitter */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Twitter (optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                @
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value.replace('@', '') })}
                className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                maxLength={200}
              />
            </div>
          </div>

          {/* Telegram */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Telegram (optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                @
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value.replace('@', '') })}
                className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                maxLength={200}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-lg font-bold transition disabled:opacity-50"
            >
              Save & Continue
            </button>
          </div>
        </form>

        {/* Info note */}
        <p className="text-gray-500 text-xs text-center mt-4">
          This info will appear on your card and leaderboard
        </p>
      </div>
    </div>
  );
}