import { useState } from 'react';
import { Bot, X } from 'lucide-react';

export default function AIRecommendFloatingTab({
  recommendations = [],
  onStationClick,
  loading = false,
  error = null,
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const count = recommendations.length;
  return (
    <>
      {/* AI Button - Fixed position above My Location button */}
      <button
        className="fixed right-4 top-[calc(50%-180px)] md:top-[calc(50%-140px)] z-[1000] w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed border-2 border-white"
        onClick={() => setOpen(!open)}
        disabled={loading}
        aria-label="Xem đề xuất AI"
        title="Gợi ý AI"
      >
        <Bot
          className={`w-5 h-5 text-white ${
            loading ? 'animate-spin' : count && !open ? 'animate-bounce' : ''
          }`}
        />
        {loading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        )}
        {count > 0 && !loading && !open && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Panel - Desktop: floating right, Mobile: bottom sheet */}
      {open && (
        <>
          {/* Backdrop for mobile - Above bottom nav */}
          <div
            className="fixed inset-0 bg-black/20 z-[1002] md:hidden"
            onClick={() => setOpen(false)}
          />
          
          {/* Panel - Highest z-index to float above everything */}
          <div
            className="fixed left-0 right-0 bottom-20 md:left-auto md:right-16 md:bottom-auto md:top-[calc(50%-140px)] w-full md:w-[420px] bg-white border-2 border-emerald-100 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slidein z-[1003] flex flex-col"
            style={{
              boxShadow: '0 -4px 32px 0 rgba(0,0,0,.1), 0 12px 32px 0 rgba(39,174,96,.15)',
              maxHeight: 'calc(75vh - 80px)', // Mobile: safer height to avoid bottom nav
            }}
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-100 flex-shrink-0">
              <h4 className="font-bold text-emerald-700 text-base flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Đề xuất AI
                {count > 0 && (
                  <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                    {count}
                  </span>
                )}
              </h4>
              <button
                className="text-gray-400 hover:text-emerald-600 rounded-lg p-1.5 hover:bg-white/50 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content - Flex-1 to fill remaining space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5" style={{ maxHeight: '70vh' }}>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">AI đang phân tích...</p>
                <p className="text-xs text-gray-400 mt-1">Đang tìm trạm phù hợp nhất</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <Bot className="w-12 h-12 text-red-300 mx-auto mb-3" />
                <p className="text-red-500 text-sm font-medium mb-2">{error}</p>
                <button 
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <>
                {(showAll ? recommendations : recommendations.slice(0, 5)).map((station, idx) => (
                  <div
                    key={station.id || station.id_tram || idx}
                    tabIndex={0}
                    role="button"
                    className="p-3 rounded-xl border border-emerald-50 hover:bg-emerald-50/70 active:bg-emerald-100 transition cursor-pointer focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                    onClick={() => onStationClick && onStationClick(station)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-base text-gray-900 truncate flex-1">
                        {station.ten_tram || station.name}
                      </div>
                      {station.ai_score && (
                        <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          {(station.ai_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {station.dia_chi || station.address}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {station.reasons &&
                        station.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
                          >
                            {r}
                          </span>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">
                      {station.distance !== undefined ? (
                        <>{station.distance.toFixed(1)} km • </>
                      ) : null}
                      Sạc ước tính{' '}
                      {station.chargeTimeMinutes
                        ? station.chargeTimeMinutes
                        : '--'}{' '}
                      phút
                    </div>
                  </div>
                ))}
                {recommendations.length > 5 && (
                  <button
                    className="w-full py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? '↑ Thu gọn' : `↓ Xem thêm ${recommendations.length - 5} trạm`}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <Bot className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Chưa có đề xuất phù hợp
                </p>
                <p className="text-xs text-gray-400">
                  Thử điều chỉnh bộ lọc hoặc mở rộng bán kính
                </p>
              </div>
            )}
            </div>
          </div>
        </>
      )}
      
      {/* Animations */}
      <style>
        {`
        @keyframes slidein { 
          from { 
            opacity: 0; 
            transform: translateY(100%);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          @keyframes slidein { 
            from { 
              opacity: 0; 
              transform: translateX(20px) scale(.95);
            }
            to { 
              opacity: 1; 
              transform: translateX(0) scale(1);
            }
          }
        }
        .animate-slidein { 
          animation: slidein .3s cubic-bezier(.34,1.56,.64,1) 1; 
        }
        `}
      </style>
    </>
  );
}
