import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

import { db, persistDb } from '../db'
import { networkDelay, requireAdmin, requireAuth, sanitizeUser } from '../utils'

type DiscussionBody = {
  body: string
  public: boolean
  title: string
}

export const discussionsHandlers = [
  http.get(`${env.API_URL}/discussions`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { error, user } = requireAuth(cookies)
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 })
      }

      const url = new URL(request.url)

      const page = Number(url.searchParams.get('page') || 1)

      const total = db.discussion.count({
        where: {
          teamId: {
            equals: user?.teamId,
          },
        },
      })

      const totalPages = Math.ceil(total / 10)

      const result = db.discussion
        .findMany({
          skip: 10 * (page - 1),
          take: 10,
          where: {
            teamId: {
              equals: user?.teamId,
            },
          },
        })
        .map(({ authorId, ...discussion }) => {
          const author = db.user.findFirst({
            where: {
              id: {
                equals: authorId,
              },
            },
          })
          return {
            ...discussion,
            author: author ? sanitizeUser(author) : {},
          }
        })
      return HttpResponse.json({
        data: result,
        meta: {
          page,
          total,
          totalPages,
        },
      })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.get(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ cookies, params }) => {
      await networkDelay()

      const discussionId = params.discussionId as string

      const discussion = db.discussion.findFirst({
        where: {
          id: {
            equals: discussionId,
          },
        },
      })

      if (discussion?.public) {
        const author = db.user.findFirst({
          where: {
            id: {
              equals: discussion.authorId,
            },
          },
        })

        const result = {
          ...discussion,
          author: author ? sanitizeUser(author) : {},
        }

        return HttpResponse.json({ data: result })
      }

      try {
        const { error, user } = requireAuth(cookies)
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 })
        }
        const discussion = db.discussion.findFirst({
          where: {
            id: {
              equals: discussionId,
            },
            teamId: {
              equals: user?.teamId,
            },
          },
        })

        if (!discussion) {
          return HttpResponse.json(
            { message: 'Discussion not found' },
            { status: 404 },
          )
        }

        const author = db.user.findFirst({
          where: {
            id: {
              equals: discussion.authorId,
            },
          },
        })

        const result = {
          ...discussion,
          author: author ? sanitizeUser(author) : {},
        }

        return HttpResponse.json({ data: result })
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),

  http.post(`${env.API_URL}/discussions`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { error, user } = requireAuth(cookies)
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 })
      }
      const data = (await request.json()) as DiscussionBody
      requireAdmin(user)
      const result = db.discussion.create({
        authorId: user?.id,
        teamId: user?.teamId,
        ...data,
      })
      await persistDb('discussion')
      return HttpResponse.json(result)
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.patch(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { error, user } = requireAuth(cookies)
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 })
        }
        const data = (await request.json()) as DiscussionBody
        const discussionId = params.discussionId as string
        requireAdmin(user)
        const result = db.discussion.update({
          data,
          where: {
            id: {
              equals: discussionId,
            },
            teamId: {
              equals: user?.teamId,
            },
          },
        })
        await persistDb('discussion')
        return HttpResponse.json(result)
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),

  http.delete(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { error, user } = requireAuth(cookies)
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 })
        }
        const discussionId = params.discussionId as string
        requireAdmin(user)
        const result = db.discussion.delete({
          where: {
            id: {
              equals: discussionId,
            },
          },
        })
        await persistDb('discussion')
        return HttpResponse.json(result)
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),
]
