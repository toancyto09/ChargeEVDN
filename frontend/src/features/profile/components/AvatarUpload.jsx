import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AvatarUpload({ currentAvatar, onUploadSuccess, userName }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/profile/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        onUploadSuccess(data.data.duong_dan_anh_dai_dien);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload thất bại. Vui lòng thử lại.');
      setPreviewUrl(currentAvatar); // Revert preview
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Preview */}
      <div className="relative group">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl ring-2 ring-gray-100">
          {previewUrl && previewUrl !== 'null' && previewUrl !== '' ? (
            <img
              src={previewUrl.startsWith('http') || previewUrl.startsWith('data:') ? previewUrl : `http://localhost:8080${previewUrl}`}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Nếu ảnh load lỗi, hiển thị avatar mặc định
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl md:text-4xl font-bold ${previewUrl && previewUrl !== 'null' && previewUrl !== '' ? 'hidden' : ''}`}
          >
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Camera Icon Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-4 ring-white"
          title="Thay đổi ảnh đại diện"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        {/* Remove Button */}
        {previewUrl && !uploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all ring-2 ring-white"
            title="Xóa ảnh"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info Text */}
      <p className="text-xs text-gray-400 text-center">
        {uploading ? 'Đang tải lên...' : 'Click vào camera để thay đổi'}
      </p>
    </div>
  );
}

