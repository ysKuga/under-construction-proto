'use client';

import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';
import { canDeleteDiscussion } from '@/lib/authorization';

import { useDeleteDiscussion } from '../api/delete-discussion';

type DeleteDiscussionProps = {
  id: string;
};

export const DeleteDiscussion = ({ id }: DeleteDiscussionProps) => {
  const user = useUser();
  const { addNotification } = useNotifications();
  const deleteDiscussionMutation = useDeleteDiscussion({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Discussion Deleted',
          type: 'success',
        });
      },
    },
  });

  if (!canDeleteDiscussion(user?.data)) {
    return null;
  }

  return (
    <ConfirmationDialog
      body="Are you sure you want to delete this discussion?"
      confirmButton={
        <Button
          isLoading={deleteDiscussionMutation.isPending}
          onClick={() => deleteDiscussionMutation.mutate({ discussionId: id })}
          type="button"
          variant="destructive"
        >
          Delete Discussion
        </Button>
      }
      icon="danger"
      title="Delete Discussion"
      triggerButton={
        <Button icon={<Trash className="size-4" />} variant="destructive">
          Delete Discussion
        </Button>
      }
    />
  );
};
