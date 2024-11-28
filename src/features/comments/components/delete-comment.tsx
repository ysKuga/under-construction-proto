'use client';

import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';

import { useDeleteComment } from '../api/delete-comment';

type DeleteCommentProps = {
  discussionId: string;
  id: string;
};

export const DeleteComment = ({ discussionId, id }: DeleteCommentProps) => {
  const { addNotification } = useNotifications();
  const deleteCommentMutation = useDeleteComment({
    discussionId,
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Comment Deleted',
          type: 'success',
        });
      },
    },
  });

  return (
    <ConfirmationDialog
      body="Are you sure you want to delete this comment?"
      confirmButton={
        <Button
          isLoading={deleteCommentMutation.isPending}
          onClick={() => deleteCommentMutation.mutate({ commentId: id })}
          type="button"
          variant="destructive"
        >
          Delete Comment
        </Button>
      }
      icon="danger"
      isDone={deleteCommentMutation.isSuccess}
      title="Delete Comment"
      triggerButton={
        <Button
          icon={<Trash className="size-4" />}
          size="sm"
          variant="destructive"
        >
          Delete Comment
        </Button>
      }
    />
  );
};
