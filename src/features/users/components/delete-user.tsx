'use client';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';

import { useDeleteUser } from '../api/delete-user';

type DeleteUserProps = {
  id: string;
};

export const DeleteUser = ({ id }: DeleteUserProps) => {
  const user = useUser();
  const { addNotification } = useNotifications();
  const deleteUserMutation = useDeleteUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'User Deleted',
          type: 'success',
        });
      },
    },
  });

  if (user.data?.id === id) return null;

  return (
    <ConfirmationDialog
      body="Are you sure you want to delete this user?"
      confirmButton={
        <Button
          isLoading={deleteUserMutation.isPending}
          onClick={() => deleteUserMutation.mutate({ userId: id })}
          type="button"
          variant="destructive"
        >
          Delete User
        </Button>
      }
      icon="danger"
      title="Delete User"
      triggerButton={<Button variant="destructive">Delete</Button>}
    />
  );
};
