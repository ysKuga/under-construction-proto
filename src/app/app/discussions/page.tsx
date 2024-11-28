import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions';

import { Discussions } from './_components/discussions';

export const metadata = {
  description: 'Discussions',
  title: 'Discussions',
};

const DiscussionsPage = async ({
  searchParams,
}: {
  searchParams: { page: null | string };
}) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    getDiscussionsQueryOptions({
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Discussions />
    </HydrationBoundary>
  );
};

export default DiscussionsPage;
