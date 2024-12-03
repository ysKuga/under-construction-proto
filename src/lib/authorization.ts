import { Comment, User } from '@/types/api'

export const canCreateDiscussion = (user: null | undefined | User) => {
  return user?.role === 'ADMIN'
}
export const canDeleteDiscussion = (user: null | undefined | User) => {
  return user?.role === 'ADMIN'
}
export const canUpdateDiscussion = (user: null | undefined | User) => {
  return user?.role === 'ADMIN'
}

export const canViewUsers = (user: null | undefined | User) => {
  return user?.role === 'ADMIN'
}

export const canDeleteComment = (
  user: null | undefined | User,
  comment: Comment,
) => {
  if (user?.role === 'ADMIN') {
    return true
  }

  if (user?.role === 'USER' && comment.author?.id === user.id) {
    return true
  }

  return false
}
