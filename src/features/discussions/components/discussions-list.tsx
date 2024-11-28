'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';

import { getDiscussionQueryOptions } from '../api/get-discussion';
import { useDiscussions } from '../api/get-discussions';

import { DeleteDiscussion } from './delete-discussion';

export type DiscussionsListProps = {
  onDiscussionPrefetch?: (id: string) => void;
};

export const DiscussionsList = ({
  onDiscussionPrefetch,
}: DiscussionsListProps) => {
  const searchParams = useSearchParams();
  const page = searchParams?.get('page') ? Number(searchParams.get('page')) : 1;

  const discussionsQuery = useDiscussions({
    page: page,
  });
  const queryClient = useQueryClient();

  if (discussionsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const discussions = discussionsQuery.data?.data;
  const meta = discussionsQuery.data?.meta;

  if (!discussions) return null;

  return (
    <Table
      columns={[
        {
          field: 'title',
          title: 'Title',
        },
        {
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
          field: 'createdAt',
          title: 'Created At',
        },
        {
          Cell({ entry: { id } }) {
            return (
              <Link
                href={paths.app.discussion.getHref(id)}
                onMouseEnter={() => {
                  // Prefetch the discussion data when the user hovers over the link
                  queryClient.prefetchQuery(getDiscussionQueryOptions(id));
                  onDiscussionPrefetch?.(id);
                }}
              >
                View
              </Link>
            );
          },
          field: 'id',
          title: '',
        },
        {
          Cell({ entry: { id } }) {
            return <DeleteDiscussion id={id} />;
          },
          field: 'id',
          title: '',
        },
      ]}
      data={discussions}
      pagination={
        meta && {
          currentPage: meta.page,
          rootUrl: '',
          totalPages: meta.totalPages,
        }
      }
    />
  );
};
