import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Confirm Dialog Context
 * Professional confirmation dialog for thesis demo
 */
const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [config, setConfig] = useState(null);

  const confirm = ({ 
    title = 'Xác nhận',
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning', // 'warning', 'danger', 'success'
    onConfirm,
    onCancel
  }) => {
    return new Promise((resolve) => {
      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          resolve(true);
          if (onConfirm) onConfirm();
          setConfig(null);
        },
        onCancel: () => {
          resolve(false);
          if (onCancel) onCancel();
          setConfig(null);
        }
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {config && <ConfirmDialog {...config} />}
    </ConfirmContext.Provider>
  );
}

ConfirmProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

// Confirm Dialog Component
function ConfirmDialog({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  type,
  onConfirm, 
  onCancel 
}) {
  const typeConfig = {
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-200'
    },
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-200'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      confirmBg: 'bg-emerald-600 hover:bg-emerald-700',
      border: 'border-emerald-200'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white font-medium rounded-lg transition-colors shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['warning', 'danger', 'success']),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
