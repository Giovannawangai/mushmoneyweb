import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const rootFor = (pathname, roots, fallback) => {
  const sorted = [...roots].sort((a, b) => b.length - a.length);
  return sorted.find((root) => pathname === root || pathname.startsWith(`${root}/`)) || fallback;
};

// Native-style tab behavior: each tab remembers the last screen visited inside it,
// screen scroll positions are restored, and re-selecting the active tab resets it
// to its root screen.
export default function useTabNavigation(roots, homeRoot = roots[0]) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lastPath = useRef({});
  const scrollPos = useRef({});

  useEffect(() => {
    const save = () => {
      scrollPos.current[pathname] = window.scrollY;
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [pathname]);

  useEffect(() => {
    lastPath.current[rootFor(pathname, roots, homeRoot)] = pathname;
    const y = scrollPos.current[pathname];
    if (!y) return undefined;
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [pathname, roots, homeRoot]);

  const onTabClick = (root) => (event) => {
    event.preventDefault();
    const active = rootFor(pathname, roots, homeRoot) === root;
    if (active) {
      lastPath.current[root] = root;
      scrollPos.current[root] = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (pathname !== root) navigate(root);
      return;
    }
    navigate(lastPath.current[root] || root);
  };

  return { onTabClick };
}