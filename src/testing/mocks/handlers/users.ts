import { http, HttpResponse } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import {
  networkDelay,
  requireAdmin,
  requireAuth,
  sanitizeUser,
} from '../utils';

type ProfileBody = {
  bio: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const usersHandlers = [
  http.get(`${env.API_URL}/users`, async ({ cookies }) => {
    await networkDelay();

    try {
      const { error, user } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const result = db.user
        .findMany({
          where: {
            teamId: {
              equals: user?.teamId,
            },
          },
        })
        .map(sanitizeUser);

      return HttpResponse.json({ data: result });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.patch(`${env.API_URL}/users/profile`, async ({ cookies, request }) => {
    await networkDelay();

    try {
      const { error, user } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const data = (await request.json()) as ProfileBody;
      const result = db.user.update({
        data,
        where: {
          id: {
            equals: user?.id,
          },
        },
      });
      await persistDb('user');
      return HttpResponse.json(result);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.delete(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay();

    try {
      const { error, user } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const userId = params.userId as string;
      requireAdmin(user);
      const result = db.user.delete({
        where: {
          id: {
            equals: userId,
          },
          teamId: {
            equals: user?.teamId,
          },
        },
      });
      await persistDb('user');
      return HttpResponse.json(result);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
