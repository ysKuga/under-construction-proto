const buildSuffix = (url?: {query?: Record<string, string>, hash?: string}) => {
  const query = url?.query;
  const hash = url?.hash;
  if (!query && !hash) return '';
  const search = query ? `?${new URLSearchParams(query)}` : '';
  return `${search}${hash ? `#${hash}` : ''}`;
};

export const pagesPath = {
  "app": {
    "discussions": {
      _discussionId: (discussionId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/app/discussions/[discussionId]' as const, query: { discussionId }, hash: url?.hash, path: `/app/discussions/${discussionId}${buildSuffix(url)}` })
      }),
      $url: (url?: { hash?: string }) => ({ pathname: '/app/discussions' as const, hash: url?.hash, path: `/app/discussions${buildSuffix(url)}` })
    },
    "profile": {
      $url: (url?: { hash?: string }) => ({ pathname: '/app/profile' as const, hash: url?.hash, path: `/app/profile${buildSuffix(url)}` })
    },
    "users": {
      $url: (url?: { hash?: string }) => ({ pathname: '/app/users' as const, hash: url?.hash, path: `/app/users${buildSuffix(url)}` })
    },
    $url: (url?: { hash?: string }) => ({ pathname: '/app' as const, hash: url?.hash, path: `/app${buildSuffix(url)}` })
  },
  "auth": {
    "login": {
      $url: (url?: { hash?: string }) => ({ pathname: '/auth/login' as const, hash: url?.hash, path: `/auth/login${buildSuffix(url)}` })
    },
    "register": {
      $url: (url?: { hash?: string }) => ({ pathname: '/auth/register' as const, hash: url?.hash, path: `/auth/register${buildSuffix(url)}` })
    }
  },
  "public": {
    "discussions": {
      _discussionId: (discussionId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/public/discussions/[discussionId]' as const, query: { discussionId }, hash: url?.hash, path: `/public/discussions/${discussionId}${buildSuffix(url)}` })
      })
    }
  },
  $url: (url?: { hash?: string }) => ({ pathname: '/' as const, hash: url?.hash, path: `/${buildSuffix(url)}` })
};

export type PagesPath = typeof pagesPath;
