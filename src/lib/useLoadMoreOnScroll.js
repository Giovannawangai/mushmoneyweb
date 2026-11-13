import { useEffect } from 'react';

// Pulls the next page only when the user scrolls near the bottom of the page,
// instead of eagerly walking every page up to a fixed record ceiling on load.
export default function useLoadMoreOnScroll(query) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = document.scrollingElement || document.documentElement;
        if (el.scrollTop + window.innerHeight >= el.scrollHeight - 600) fetchNextPage();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}