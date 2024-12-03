import { Meta, StoryObj } from '@storybook/react'
import { z } from 'zod'

import { Button } from '../button'

import { Form } from './form'
import { FormDrawer } from './form-drawer'
import { Input } from './input'
import { Select } from './select'
import { Textarea } from './textarea'

const MyForm = ({ hideSubmit = false }: { hideSubmit?: boolean }) => {
  return (
    <Form
      id="my-form"
      onSubmit={async (values) => {
        alert(JSON.stringify(values, null, 2))
      }}
      schema={z.object({
        description: z.string().min(1, 'Required'),
        title: z.string().min(1, 'Required'),
        type: z.string().min(1, 'Required'),
      })}
    >
      {({ formState, register }) => (
        <>
          <Input
            error={formState.errors['title']}
            label="Title"
            registration={register('title')}
          />
          <Textarea
            error={formState.errors['description']}
            label="Description"
            registration={register('description')}
          />
          <Select
            error={formState.errors['type']}
            label="Type"
            options={['A', 'B', 'C'].map((type) => ({
              label: type,
              value: type,
            }))}
            registration={register('type')}
          />

          {!hideSubmit && (
            <div>
              <Button className="w-full" type="submit">
                Submit
              </Button>
            </div>
          )}
        </>
      )}
    </Form>
  )
}

const meta: Meta = {
  component: MyForm,
}

export default meta

type Story = StoryObj<typeof MyForm>

export const Default: Story = {
  render: () => <MyForm />,
}

export const AsFormDrawer: Story = {
  render: () => (
    <FormDrawer
      isDone={true}
      submitButton={
        <Button form="my-form" type="submit">
          Submit
        </Button>
      }
      title="My Form"
      triggerButton={<Button>Open Form</Button>}
    >
      <MyForm hideSubmit />
    </FormDrawer>
  ),
}
