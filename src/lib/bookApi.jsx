import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useLoadMoreOnScroll from '@/lib/useLoadMoreOnScroll';

const PAGE_SIZE = 100;

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: () => base44.entities.Client.list('name', 500) });

export const useClient = (id) =>
  useQuery({ queryKey: ['client', id], queryFn: () => base44.entities.Client.get(id), enabled: !!id });

export const useVisits = () => {
  const query = useInfiniteQuery({
    queryKey: ['visits'],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      base44.entities.Visit.list({
        sort: '-date',
        limit: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage) => (lastPage?.has_more ? lastPage.next_cursor : undefined),
    select: (data) =>
      data.pages.flatMap((page) => (Array.isArray(page) ? page : page?.items || [])),
  });

  useLoadMoreOnScroll(query);

  return query;
};

export const useBookRefresh = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['clients'] });
    qc.invalidateQueries({ queryKey: ['client'] });
    qc.invalidateQueries({ queryKey: ['visits'] });
  };
};