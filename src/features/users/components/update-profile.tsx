'use client';

import { Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormDrawer, Input, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';

import {
  updateProfileInputSchema,
  useUpdateProfile,
} from '../api/update-profile';

export const UpdateProfile = () => {
  const user = useUser();
  const { addNotification } = useNotifications();
  const updateProfileMutation = useUpdateProfile({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Profile Updated',
          type: 'success',
        });
      },
    },
  });

  return (
    <FormDrawer
      isDone={updateProfileMutation.isSuccess}
      submitButton={
        <Button
          form="update-profile"
          isLoading={updateProfileMutation.isPending}
          size="sm"
          type="submit"
        >
          Submit
        </Button>
      }
      title="Update Profile"
      triggerButton={
        <Button icon={<Pen className="size-4" />} size="sm">
          Update Profile
        </Button>
      }
    >
      <Form
        id="update-profile"
        onSubmit={(values) => {
          updateProfileMutation.mutate({ data: values });
        }}
        options={{
          defaultValues: {
            bio: user.data?.bio ?? '',
            email: user.data?.email ?? '',
            firstName: user.data?.firstName ?? '',
            lastName: user.data?.lastName ?? '',
          },
        }}
        schema={updateProfileInputSchema}
      >
        {({ formState, register }) => (
          <>
            <Input
              error={formState.errors['firstName']}
              label="First Name"
              registration={register('firstName')}
            />
            <Input
              error={formState.errors['lastName']}
              label="Last Name"
              registration={register('lastName')}
            />
            <Input
              error={formState.errors['email']}
              label="Email Address"
              registration={register('email')}
              type="email"
            />

            <Textarea
              error={formState.errors['bio']}
              label="Bio"
              registration={register('bio')}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
