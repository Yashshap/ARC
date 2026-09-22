import React, { useState, useEffect } from 'react';
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
  const [prevIsOpen, setPrevIsOpen] = useState(Boolean(isOpen));
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));

  // Sync state during render when opening to avoid cascading effect renders
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setShouldRender(true);
    }
  }

  // Purely derived closing state: open became false while still rendered
  const isClosing = !isOpen && shouldRender;

  useEffect(() => {
    if (isClosing) {
      // Transition from open to closed -> unmount after slide-out animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

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
