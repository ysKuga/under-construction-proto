import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { QueryConfig } from '@/lib/react-query'
import { Comment, Meta } from '@/types/api'

export const getComments = ({
  discussionId,
  page = 1,
}: {
  discussionId: string
  page?: number
}): Promise<{ data: Comment[]; meta: Meta }> => {
  return api.get(`/comments`, {
    params: {
      discussionId,
      page,
    },
  })
}

export const getInfiniteCommentsQueryOptions = (discussionId: string) => {
  return infiniteQueryOptions<{ data: Comment[]; meta: Meta }>({
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.page === lastPage?.meta?.totalPages) return undefined
      const nextPage = lastPage.meta.page + 1
      return nextPage
    },
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      return getComments({ discussionId, page: pageParam as number })
    },
    queryKey: ['comments', discussionId],
  })
}

type UseCommentsOptions = {
  discussionId: string
  page?: number
  queryConfig?: QueryConfig<typeof getComments>
}

export const useInfiniteComments = ({ discussionId }: UseCommentsOptions) => {
  return useInfiniteQuery({
    ...getInfiniteCommentsQueryOptions(discussionId),
  })
}
