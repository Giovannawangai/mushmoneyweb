import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PAGE_SIZE = 100;
const MAX_RECORDS = 1000;

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

  const loaded = query.data?.length ?? 0;
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && loaded < MAX_RECORDS) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, loaded, query.fetchNextPage]);

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