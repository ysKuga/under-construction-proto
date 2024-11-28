'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormDrawer, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';

import {
  createCommentInputSchema,
  useCreateComment,
} from '../api/create-comment';

type CreateCommentProps = {
  discussionId: string;
};

export const CreateComment = ({ discussionId }: CreateCommentProps) => {
  const { addNotification } = useNotifications();
  const createCommentMutation = useCreateComment({
    discussionId,
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Comment Created',
          type: 'success',
        });
      },
    },
  });

  return (
    <FormDrawer
      isDone={createCommentMutation.isSuccess}
      submitButton={
        <Button
          disabled={createCommentMutation.isPending}
          form="create-comment"
          isLoading={createCommentMutation.isPending}
          size="sm"
          type="submit"
        >
          Submit
        </Button>
      }
      title="Create Comment"
      triggerButton={
        <Button icon={<Plus className="size-4" />} size="sm">
          Create Comment
        </Button>
      }
    >
      <Form
        id="create-comment"
        onSubmit={(values) => {
          createCommentMutation.mutate({
            data: values,
          });
        }}
        options={{
          defaultValues: {
            body: '',
            discussionId: discussionId,
          },
        }}
        schema={createCommentInputSchema}
      >
        {({ formState, register }) => (
          <Textarea
            error={formState.errors['body']}
            label="Body"
            registration={register('body')}
          />
        )}
      </Form>
    </FormDrawer>
  );
};
