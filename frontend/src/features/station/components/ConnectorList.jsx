import { Zap, CheckCircle, Circle, Wrench, TrendingUp } from 'lucide-react';

export default function ConnectorList({ connectors }) {
  if (!connectors || connectors.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Cổng sạc</h2>
        </div>
        <p className="text-gray-500">Chưa có thông tin cổng sạc</p>
      </div>
    );
  }

  const getStatusColor = (available, total) => {
    const avail = parseInt(available) || 0;
    const tot = parseInt(total) || 1;
    const ratio = avail / tot;
    if (ratio >= 0.7) return 'from-green-500 to-emerald-600';
    if (ratio >= 0.3) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getStatusBadgeColor = (available, total) => {
    const avail = parseInt(available) || 0;
    const tot = parseInt(total) || 1;
    const ratio = avail / tot;
    if (ratio >= 0.7) return 'bg-green-100 text-green-700 border-green-200';
    if (ratio >= 0.3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const totalConnectors = connectors.reduce((sum, c) => sum + (parseInt(c.tong_cong) || 0), 0);
  const totalAvailable = connectors.reduce((sum, c) => sum + (parseInt(c.cong_trong) || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 sm:px-6 py-4 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cổng sạc</h2>
              <p className="text-xs text-gray-600">{connectors.length} loại cổng khả dụng</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{totalAvailable}</div>
            <div className="text-xs text-gray-600">/{totalConnectors} trống</div>
          </div>
        </div>
      </div>

      {/* Connectors List */}
      <div className="p-4 sm:p-6 space-y-3">
        {connectors.map((connector, index) => {
          const available = parseInt(connector.cong_trong) || 0;
          const total = parseInt(connector.tong_cong) || 0;
          const inUse = parseInt(connector.dang_su_dung) || 0;
          const maintenance = parseInt(connector.bao_tri) || 0;
          const availabilityPercent = total > 0 ? (available / total) * 100 : 0;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all hover:shadow-md group"
            >
              {/* Background gradient indicator */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(available, total)} opacity-5 group-hover:opacity-10 transition-opacity`}
              />
              
              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(available, total)} rounded-xl flex items-center justify-center shadow-md`}>
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                        {connector.loai_cong || connector.ten_loai_cong}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {connector.cong_suat_kw} kW
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Availability Badge */}
                  <div className={`px-3 py-1.5 rounded-full border-2 text-xs sm:text-sm font-bold ${getStatusBadgeColor(available, total)} whitespace-nowrap`}>
                    {available}/{total}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getStatusColor(available, total)} transition-all duration-500 rounded-full`}
                      style={{ width: `${availabilityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status Details */}
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                  {available > 0 && (
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">{available} sẵn sàng</span>
                    </div>
                  )}
                  {inUse > 0 && (
                    <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg">
                      <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-medium">{inUse} đang dùng</span>
                    </div>
                  )}
                  {maintenance > 0 && (
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                      <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">{maintenance} bảo trì</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {connector.mo_ta && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {connector.mo_ta}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 sm:px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalConnectors}</div>
            <div className="text-xs text-gray-600 mt-1">Tổng số cổng</div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{totalAvailable}</div>
            <div className="text-xs text-gray-600 mt-1">Đang trống</div>
          </div>
        </div>
      </div>
    </div>
  );
}

