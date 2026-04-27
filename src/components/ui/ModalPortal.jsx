import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalPortal — renders children into document.body so they escape
 * any transformed ancestor (e.g. PageTransition's motion.div) and
 * `position: fixed` is anchored to the actual viewport.
 */
export default function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}