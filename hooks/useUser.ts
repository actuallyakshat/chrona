import { convexQuery } from '@convex-dev/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../convex/_generated/api';

export default function useUser() {
  const query = convexQuery(api.user.getCurrentUser, {});
  const queryClient = useQueryClient();

  const {
    data: user,
    isPending,
    error,
    isFetchedAfterMount,
    ...reactQueryOptions
  } = useQuery(query);

  // Check if cached
  const cachedData = queryClient.getQueryData(query.queryKey);
  const isCached = Boolean(cachedData);

  return { user, isPending, error, isCached, isFetchedAfterMount, ...reactQueryOptions };
}
