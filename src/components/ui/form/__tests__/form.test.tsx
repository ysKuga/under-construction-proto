import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils'

import { Form } from '../form'
import { Input } from '../input'

const testData = {
  title: 'Hello World',
}

const schema = z.object({
  title: z.string().min(1, 'Required'),
})

test('should render and submit a basic Form component', async () => {
  const handleSubmit = vi.fn() as SubmitHandler<z.infer<typeof schema>>

  rtlRender(
    <Form id="my-form" onSubmit={handleSubmit} schema={schema}>
      {({ formState, register }) => (
        <>
          <Input
            error={formState.errors['title']}
            label="Title"
            registration={register('title')}
          />

          <Button className="w-full" name="submit" type="submit">
            Submit
          </Button>
        </>
      )}
    </Form>,
  )

  await userEvent.type(screen.getByLabelText(/title/i), testData.title)

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(testData, expect.anything()),
  )
})

test('should fail submission if validation fails', async () => {
  const handleSubmit = vi.fn() as SubmitHandler<z.infer<typeof schema>>

  rtlRender(
    <Form id="my-form" onSubmit={handleSubmit} schema={schema}>
      {({ formState, register }) => (
        <>
          <Input
            error={formState.errors['title']}
            label="Title"
            registration={register('title')}
          />

          <Button className="w-full" name="submit" type="submit">
            Submit
          </Button>
        </>
      )}
    </Form>,
  )

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  await screen.findByRole('alert', { name: /required/i })

  expect(handleSubmit).toHaveBeenCalledTimes(0)
})
