/**
 * PageLayout - Universal layout wrapper for all pages
 * Automatically handles spacing for BottomNav (64px) + optional fixed bottom actions
 * 
 * Usage:
 * <PageLayout>
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
      {children}
    </div>
  );
}

