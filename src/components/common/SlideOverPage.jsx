import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * SlideOverPage
 * Renders a smooth native-app-style full-screen page that slides in from the right
 * and slides out to the right when dismissed.
 * Portals directly into `#app-viewport` so underlying Header, Navbar, and screen
 * remain fully rendered with zero layout shift or flicker.
 */
export default function SlideOverPage({
  isOpen,
  onClose,
  children,
  zIndex = 500,
  className = '',
}) {
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));
  const [isClosing, setIsClosing] = useState(false);
  const wasOpenRef = useRef(Boolean(isOpen));

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setShouldRender(true);
      setIsClosing(false);
    } else if (wasOpenRef.current) {
      // Transition from open to closed -> trigger slide-out exit animation
      wasOpenRef.current = false;
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const targetEl =
    (typeof document !== 'undefined' && document.getElementById('app-viewport')) ||
    (typeof document !== 'undefined' ? document.body : null);
  if (!targetEl) return null;

  const handleClose = () => {
    if (onClose) onClose();
  };

  return createPortal(
    <div
      className={`slide-over-page ${isClosing ? 'slide-over-exit' : 'slide-over-enter'} ${className}`}
      style={{ zIndex }}
    >
      {typeof children === 'function' ? children({ close: handleClose, isClosing }) : children}
    </div>,
    targetEl
  );
}
