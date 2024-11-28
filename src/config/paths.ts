export const paths = {
  app: {
    dashboard: {
      getHref: () => '/app',
    },
    discussion: {
      getHref: (id: string) => `/app/discussions/${id}`,
    },
    discussions: {
      getHref: () => '/app/discussions',
    },
    profile: {
      getHref: () => '/app/profile',
    },
    root: {
      getHref: () => '/app',
    },
    users: {
      getHref: () => '/app/users',
    },
  },

  auth: {
    login: {
      getHref: (redirectTo?: null | string | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      getHref: (redirectTo?: null | string | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  home: {
    getHref: () => '/',
  },
  public: {
    discussion: {
      getHref: (id: string) => `/public/discussions/${id}`,
    },
  },
} as const;
