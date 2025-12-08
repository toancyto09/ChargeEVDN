import { ArrowLeft } from 'lucide-react';

/**
 * PageLayout - Universal layout wrapper for all pages
 * Automatically handles spacing for BottomNav (64px) + optional fixed bottom actions
 * 
 * Usage:
 * <PageLayout>
 *   <YourPageContent />
 * </PageLayout>
 * 
 * With title and back button:
 * <PageLayout title="Page Title" showBack onBack={() => navigate(-1)}>
 *   <YourPageContent />
 * </PageLayout>
 * 
 * With fixed bottom actions:
 * <PageLayout hasBottomActions>
 *   <YourPageContent />
 * </PageLayout>
 */

export default function PageLayout({ 
  children, 
  title = '',
  showBack = false,
  onBack = null,
  hasBottomActions = false,
  className = '',
  noPadding = false,
}) {
  // Calculate padding-bottom:
  // - BottomNav: 64px (h-16)
  // - Bottom Actions (if exists): ~72px
  // - Extra spacing: 8px
  const paddingClass = noPadding 
    ? '' 
    : hasBottomActions 
      ? 'pb-44' // 176px = 64 (nav) + 72 (actions) + 40 (spacing)
      : 'pb-20'; // 80px = 64 (nav) + 16 (spacing)

  return (
    <div className={`min-h-screen ${paddingClass} ${className}`}>
      {/* Header with back button and title */}
      {(title || showBack) && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center px-4 py-3 max-w-5xl mx-auto">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}
            {title && (
              <h1 className="text-xl font-bold text-gray-900 flex-1">
                {title}
              </h1>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      {children}
    </div>
  );
}

