import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

export function BottomSheet({
  children,
  isOpen,
  onToggle,
  snapPoints = [0.15, 0.5, 0.9],
}) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentSnap = useRef(0); // 0 = collapsed, 1 = half, 2 = full

  useEffect(() => {
    if (!sheetRef.current) return;

    const sheet = sheetRef.current;
    const viewportHeight = window.innerHeight;

    // Set initial position (collapsed)
    const initialHeight = snapPoints[0] * viewportHeight;
    sheet.style.height = `${initialHeight}px`;

    const handleTouchStart = (e) => {
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const deltaY = startY.current - e.touches[0].clientY;
      const currentHeight = sheet.offsetHeight;
      const newHeight = Math.max(
        snapPoints[0] * viewportHeight,
        Math.min(snapPoints[2] * viewportHeight, currentHeight + deltaY)
      );

      sheet.style.height = `${newHeight}px`;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const currentHeight = sheet.offsetHeight;

      // Snap to nearest point
      let nearestSnap = 0;
      let minDiff = Math.abs(currentHeight - snapPoints[0] * viewportHeight);

      snapPoints.forEach((point, index) => {
        const diff = Math.abs(currentHeight - point * viewportHeight);
        if (diff < minDiff) {
          minDiff = diff;
          nearestSnap = index;
        }
      });

      currentSnap.current = nearestSnap;
      const snapHeight = snapPoints[nearestSnap] * viewportHeight;
      sheet.style.transition = 'height 0.3s ease-out';
      sheet.style.height = `${snapHeight}px`;

      setTimeout(() => {
        sheet.style.transition = '';
      }, 300);
    };

    const handleElement = sheet.querySelector('[data-handle]');
    if (handleElement) {
      handleElement.addEventListener('touchstart', handleTouchStart);
      handleElement.addEventListener('touchmove', handleTouchMove);
      handleElement.addEventListener('touchend', handleTouchEnd);

      return () => {
        handleElement.removeEventListener('touchstart', handleTouchStart);
        handleElement.removeEventListener('touchmove', handleTouchMove);
        handleElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [snapPoints]);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[45] flex flex-col"
    >
      {/* Drag Handle */}
      <div
        data-handle
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
        <ChevronUp size={20} className="text-gray-400" />
      </div>

      {/* Content với padding-bottom cho BottomNav */}
      <div className="flex-1 overflow-y-auto pb-20">{children}</div>
    </div>
  );
}
