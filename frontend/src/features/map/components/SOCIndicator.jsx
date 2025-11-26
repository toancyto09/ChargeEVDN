import { Battery, AlertTriangle, Zap } from 'lucide-react';

/**
 * SOC (State of Charge) Indicator Component
 * Shows battery level with visual indicators and context
 */
export function SOCIndicator({ level = 50, showContext = true, size = 'md' }) {
  const getSOCInfo = (level) => {
    if (level < 20) {
      return {
        status: 'critical',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        text: 'Pin sắp hết',
        context: 'Ưu tiên trạm gần nhất',
        priority: 'proximity'
      };
    } else if (level < 50) {
      return {
        status: 'low',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: Battery,
        text: 'Pin thấp',
        context: 'Cân bằng khoảng cách và giá',
        priority: 'balanced'
      };
    } else {
      return {
        status: 'normal',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: Zap,
        text: 'Pin ổn',
        context: 'Ưu tiên giá cả và chất lượng',
        priority: 'quality'
      };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'w-5 h-5',
          text: 'text-base'
        };
      default: // md
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4',
          text: 'text-sm'
        };
    }
  };

  const socInfo = getSOCInfo(level);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = socInfo.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border ${socInfo.bgColor} ${socInfo.borderColor} ${sizeClasses.container}`}>
      <IconComponent className={`${socInfo.color} ${sizeClasses.icon}`} />
      <div className="flex flex-col">
        <span className={`font-medium ${socInfo.color} ${sizeClasses.text}`}>
          {socInfo.text} ({level}%)
        </span>
        {showContext && (
          <span className={`text-xs ${socInfo.color} opacity-75`}>
            {socInfo.context}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * SOC Progress Bar Component
 * Shows battery level as a progress bar
 */
export function SOCProgressBar({ level = 50, showLabel = true, className = '' }) {
  const getProgressColor = (level) => {
    if (level < 20) return 'bg-red-500';
    if (level < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (level) => {
    if (level < 20) return 'text-red-600';
    if (level < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Mức pin</span>
          <span className={`text-sm font-bold ${getTextColor(level)}`}>
            {level}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(level)}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/**
 * SOC Context Helper
 * Returns context information based on SOC level
 */
export const getSOCContext = (level) => {
  if (level < 20) {
    return {
      urgency: 'high',
      recommendation: 'Tìm trạm sạc gần nhất ngay lập tức',
      aiWeights: { proximity: 0.5, availability: 0.15, price: 0.1, quality: 0.15, wait: 0.1 }
    };
  } else if (level < 50) {
    return {
      urgency: 'medium',
      recommendation: 'Cân nhắc trạm sạc trong vòng 30 phút',
      aiWeights: { proximity: 0.35, availability: 0.2, price: 0.15, quality: 0.2, wait: 0.1 }
    };
  } else {
    return {
      urgency: 'low',
      recommendation: 'Có thể lựa chọn trạm sạc tốt nhất',
      aiWeights: { proximity: 0.25, availability: 0.15, price: 0.25, quality: 0.2, wait: 0.15 }
    };
  }
};
