'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormDrawer,
  Input,
  Label,
  Switch,
  Textarea,
} from '@/components/ui/form'
import { useNotifications } from '@/components/ui/notifications'
import { useUser } from '@/lib/auth'
import { canCreateDiscussion } from '@/lib/authorization'

import {
  createDiscussionInputSchema,
  useCreateDiscussion,
} from '../api/create-discussion'

export const CreateDiscussion = () => {
  const { addNotification } = useNotifications()
  const createDiscussionMutation = useCreateDiscussion({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          title: 'Discussion Created',
          type: 'success',
        })
      },
    },
  })

  const user = useUser()

  if (!canCreateDiscussion(user?.data)) {
    return null
  }

  return (
    <FormDrawer
      isDone={createDiscussionMutation.isSuccess}
      submitButton={
        <Button
          form="create-discussion"
          isLoading={createDiscussionMutation.isPending}
          size="sm"
          type="submit"
        >
          Submit
        </Button>
      }
      title="Create Discussion"
      triggerButton={
        <Button icon={<Plus className="size-4" />} size="sm">
          Create Discussion
        </Button>
      }
    >
      <Form
        id="create-discussion"
        onSubmit={(values) => {
          createDiscussionMutation.mutate({ data: values })
        }}
        options={{
          defaultValues: {
            body: '',
            public: false,
            title: '',
          },
        }}
        schema={createDiscussionInputSchema}
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
  )
}
