import Cookies from 'js-cookie'
import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'

import { db, persistDb } from '../db'
import {
  AUTH_COOKIE,
  authenticate,
  hash,
  networkDelay,
  requireAuth,
} from '../utils'

type RegisterBody = {
  email: string
  firstName: string
  lastName: string
  password: string
  teamId?: string
  teamName?: string
}

type LoginBody = {
  email: string
  password: string
}

export const authHandlers = [
  http.post(`${env.API_URL}/auth/register`, async ({ request }) => {
    await networkDelay()
    try {
      const userObject = (await request.json()) as RegisterBody

      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: userObject.email,
          },
        },
      })

      if (existingUser) {
        return HttpResponse.json(
          { message: 'The user already exists' },
          { status: 400 },
        )
      }

      let teamId
      let role

      if (!userObject.teamId) {
        const team = db.team.create({
          name: userObject.teamName ?? `${userObject.firstName} Team`,
        })
        await persistDb('team')
        teamId = team.id
        role = 'ADMIN'
      } else {
        const existingTeam = db.team.findFirst({
          where: {
            id: {
              equals: userObject.teamId,
            },
          },
        })

        if (!existingTeam) {
          return HttpResponse.json(
            {
              message: 'The team you are trying to join does not exist!',
            },
            { status: 400 },
          )
        }
        teamId = userObject.teamId
        role = 'USER'
      }

      db.user.create({
        ...userObject,
        password: hash(userObject.password),
        role,
        teamId,
      })

      await persistDb('user')

      const result = authenticate({
        email: userObject.email,
        password: userObject.password,
      })

      // todo: remove once tests in Github Actions are fixed
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' })

      return HttpResponse.json(result, {
        headers: {
          // with a real API servier, the token cookie should also be Secure and HttpOnly
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.post(`${env.API_URL}/auth/login`, async ({ request }) => {
    await networkDelay()

    try {
      const credentials = (await request.json()) as LoginBody
      const result = authenticate(credentials)

      // todo: remove once tests in Github Actions are fixed
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' })

      return HttpResponse.json(result, {
        headers: {
          // with a real API servier, the token cookie should also be Secure and HttpOnly
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.post(`${env.API_URL}/auth/logout`, async () => {
    await networkDelay()

    // todo: remove once tests in Github Actions are fixed
    Cookies.remove(AUTH_COOKIE)

    return HttpResponse.json(
      { message: 'Logged out' },
      {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=; Path=/;`,
        },
      },
    )
  }),

  http.get(`${env.API_URL}/auth/me`, async ({ cookies }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)
      return HttpResponse.json({ data: user })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),
]
