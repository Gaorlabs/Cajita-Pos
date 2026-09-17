import { useState, useEffect, useCallback } from 'react';

export const isFullscreenActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

export const isFullscreenAvailable = (): boolean => {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled ||
    (document.documentElement as any).requestFullscreen ||
    (document.documentElement as any).webkitRequestFullscreen
  );
};

export const toggleFullscreenMode = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  try {
    if (!isFullscreenActive()) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      }
      return true;
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      return false;
    }
  } catch (err) {
    console.warn('Fullscreen mode change encountered an exception or permission restriction:', err);
    return isFullscreenActive();
  }
};

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => isFullscreenActive());
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(isFullscreenAvailable());
    const handleSync = () => {
      setIsFullscreen(isFullscreenActive());
    };

    document.addEventListener('fullscreenchange', handleSync);
    document.addEventListener('webkitfullscreenchange', handleSync);
    document.addEventListener('mozfullscreenchange', handleSync);
    document.addEventListener('MSFullscreenChange', handleSync);

    return () => {
      document.removeEventListener('fullscreenchange', handleSync);
      document.removeEventListener('webkitfullscreenchange', handleSync);
      document.removeEventListener('mozfullscreenchange', handleSync);
      document.removeEventListener('MSFullscreenChange', handleSync);
    };
  }, []);

  const toggle = useCallback(async () => {
    await toggleFullscreenMode();
    setIsFullscreen(isFullscreenActive());
  }, []);

  return { isFullscreen, isSupported, toggle };
};
