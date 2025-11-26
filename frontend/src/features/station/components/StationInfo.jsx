import { MapPin, Clock, Phone, Mail, Globe, Building2, Info } from 'lucide-react';

export default function StationInfo({ station }) {
  const hasContactInfo = station.so_dien_thoai || station.email || station.website;
  const hasOperatingInfo = station.gio_mo_cua || station.ten_cong_ty;

  return (
    <div className="space-y-4">
      {/* Contact Information */}
      {hasContactInfo && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thông tin liên hệ</h2>
                <p className="text-xs text-gray-600">Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Phone */}
            {station.so_dien_thoai && (
              <a
                href={`tel:${station.so_dien_thoai}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-300 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Số điện thoại</p>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {station.so_dien_thoai}
                  </p>
                </div>
              </a>
            )}

            {/* Email */}
            {station.email && (
              <a
                href={`mailto:${station.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 hover:border-red-300 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-0.5">Email</p>
                  <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                    {station.email}
                  </p>
                </div>
              </a>
            )}

            {/* Website */}
            {station.website && (
              <a
                href={station.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-0.5">Website</p>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {station.website}
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Operating Information */}
      {hasOperatingInfo && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 sm:px-6 py-4 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thông tin hoạt động</h2>
                <p className="text-xs text-gray-600">Chi tiết trạm sạc</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Company */}
            {station.ten_cong_ty && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Nhà cung cấp</p>
                  <p className="font-semibold text-gray-900">{station.ten_cong_ty}</p>
                </div>
              </div>
            )}

            {/* Operating Hours */}
            {station.gio_mo_cua && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Giờ mở cửa</p>
                  <p className="font-semibold text-gray-900">{station.gio_mo_cua}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {station.mo_ta && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 sm:px-6 py-4 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mô tả</h2>
                <p className="text-xs text-gray-600">Thông tin chi tiết</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {station.mo_ta}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

