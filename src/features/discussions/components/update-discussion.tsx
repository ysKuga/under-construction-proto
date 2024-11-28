'use client';

import { Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormDrawer,
  Input,
  Label,
  Switch,
  Textarea,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';
import { canUpdateDiscussion } from '@/lib/authorization';

import { useDiscussion } from '../api/get-discussion';
import {
  updateDiscussionInputSchema,
  useUpdateDiscussion,
} from '../api/update-discussion';

type UpdateDiscussionProps = {
  discussionId: string;
};

export const UpdateDiscussion = ({ discussionId }: UpdateDiscussionProps) => {
  const { addNotification } = useNotifications();
  const discussionQuery = useDiscussion({ discussionId });
  const updateDiscussionMutation = useUpdateDiscussion({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Discussion Updated',
          type: 'success',
        });
      },
    },
  });

  const user = useUser();

  if (!canUpdateDiscussion(user?.data)) {
    return null;
  }

  const discussion = discussionQuery.data?.data;

  return (
    <FormDrawer
      isDone={updateDiscussionMutation.isSuccess}
      submitButton={
        <Button
          form="update-discussion"
          isLoading={updateDiscussionMutation.isPending}
          size="sm"
          type="submit"
        >
          Submit
        </Button>
      }
      title="Update Discussion"
      triggerButton={
        <Button icon={<Pen className="size-4" />} size="sm">
          Update Discussion
        </Button>
      }
    >
      <Form
        id="update-discussion"
        onSubmit={(values) => {
          updateDiscussionMutation.mutate({
            data: values,
            discussionId,
          });
        }}
        options={{
          defaultValues: {
            body: discussion?.body ?? '',
            public: discussion?.public ?? false,
            title: discussion?.title ?? '',
          },
        }}
        schema={updateDiscussionInputSchema}
      >
        {({ formState, register, setValue, watch }) => (
          <>
            <Input
              error={formState.errors['title']}
              label="Title"
              registration={register('title')}
            />
            <Textarea
              error={formState.errors['body']}
              label="Body"
              registration={register('body')}
            />

            <div className="flex items-center space-x-2">
              <Switch
                checked={watch('public')}
                className={` relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
                id="public"
                name="public"
                onCheckedChange={(value) => setValue('public', value)}
              />
              <Label htmlFor="airplane-mode">Public</Label>
            </div>
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
