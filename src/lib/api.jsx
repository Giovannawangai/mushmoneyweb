import { base44 } from '@/api/base44Client';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// Small first page for fast first paint; remaining pages are fetched in the
// background up to the previous record ceiling so totals stay identical.
const PAGE_SIZE = 100;
const MAX_RECORDS = 1000;

const usePagedList = (queryKey, entity, sort) => {
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      base44.entities[entity].list({
        sort,
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

export const useExpenses = () => usePagedList(['expenses'], 'Expense', '-date');

export const useIncomes = () => usePagedList(['incomes'], 'Income', '-date');

export const useBills = () =>
  useQuery({ queryKey: ['bills'], queryFn: async () => base44.entities.Bill.list('-created_date', 200) });

export const useGoals = () =>
  useQuery({ queryKey: ['goals'], queryFn: async () => base44.entities.Goal.list('-created_date', 200) });

export const useKeywordRules = () =>
  useQuery({ queryKey: ['keywordRules'], queryFn: async () => base44.entities.KeywordRule.list('-created_date', 200) });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: async () => base44.entities.Category.list('sort_order', 100) });

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const list = await base44.entities.Settings.list();
      if (list.length === 0) return await base44.entities.Settings.create({ budget: 6000, theme: 'minimal' });
      return list[0];
    },
  });

export const useRefresh = (key) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
};