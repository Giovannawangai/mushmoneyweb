// Patches a React Query cache entry that may be either a plain array (useQuery)
// or an infinite-query page structure (useInfiniteQuery), applying `updater`
// to the list of records in both cases.
export const patchList = (old, updater) => {
  if (Array.isArray(old)) return updater(old);
  if (old && Array.isArray(old.pages)) {
    return {
      ...old,
      pages: old.pages.map((page) => {
        if (Array.isArray(page)) return updater(page);
        return { ...page, items: updater(page.items || []) };
      }),
    };
  }
  return old;
};