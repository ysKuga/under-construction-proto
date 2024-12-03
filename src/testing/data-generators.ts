import {
  randCatchPhrase,
  randCompanyName,
  randEmail,
  randParagraph,
  randPassword,
  randUserName,
  randUuid,
} from '@ngneat/falso'

const generateUser = () => ({
  bio: randParagraph(),
  createdAt: Date.now(),
  email: randEmail(),
  firstName: randUserName({ withAccents: false }),
  id: randUuid() + Math.random(),
  lastName: randUserName({ withAccents: false }),
  password: randPassword(),
  role: 'ADMIN',
  teamId: randUuid(),
  teamName: randCompanyName(),
})

export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T,
) => {
  return { ...generateUser(), ...overrides }
}

const generateTeam = () => ({
  createdAt: Date.now(),
  description: randParagraph(),
  id: randUuid(),
  name: randCompanyName(),
})

export const createTeam = <T extends Partial<ReturnType<typeof generateTeam>>>(
  overrides?: T,
) => {
  return { ...generateTeam(), ...overrides }
}

const generateDiscussion = () => ({
  body: randParagraph(),
  createdAt: Date.now(),
  id: randUuid(),
  public: true,
  title: randCatchPhrase(),
})

export const createDiscussion = <
  T extends Partial<ReturnType<typeof generateDiscussion>>,
>(
  overrides?: {
    authorId?: string
    teamId?: string
  } & T,
) => {
  return { ...generateDiscussion(), ...overrides }
}

const generateComment = () => ({
  body: randParagraph(),
  createdAt: Date.now(),
  id: randUuid(),
})

export const createComment = <
  T extends Partial<ReturnType<typeof generateComment>>,
>(
  overrides?: {
    authorId?: string
    discussionId?: string
  } & T,
) => {
  return { ...generateComment(), ...overrides }
}
