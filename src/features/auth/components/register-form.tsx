'use client'

import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Form, Input, Label, Select, Switch } from '@/components/ui/form'
import { paths } from '@/config/paths'
import { registerInputSchema, useRegister } from '@/lib/auth'
import { Team } from '@/types/api'

type RegisterFormProps = {
  chooseTeam: boolean
  onSuccess: () => void
  setChooseTeam: () => void
  teams?: Team[]
}

export const RegisterForm = ({
  chooseTeam,
  onSuccess,
  setChooseTeam,
  teams,
}: RegisterFormProps) => {
  const registering = useRegister({ onSuccess })
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectTo')

  return (
    <div>
      <Form
        onSubmit={(values) => {
          registering.mutate(values)
        }}
        options={{
          shouldUnregister: true,
        }}
        schema={registerInputSchema}
      >
        {({ formState, register }) => (
          <>
            <Input
              error={formState.errors['firstName']}
              label="First Name"
              registration={register('firstName')}
              type="text"
            />
            <Input
              error={formState.errors['lastName']}
              label="Last Name"
              registration={register('lastName')}
              type="text"
            />
            <Input
              error={formState.errors['email']}
              label="Email Address"
              registration={register('email')}
              type="email"
            />
            <Input
              error={formState.errors['password']}
              label="Password"
              registration={register('password')}
              type="password"
            />

            <div className="flex items-center space-x-2">
              <Switch
                checked={chooseTeam}
                className={`${
                  chooseTeam ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
                id="choose-team"
                onCheckedChange={setChooseTeam}
              />
              <Label htmlFor="airplane-mode">Join Existing Team</Label>
            </div>

            {chooseTeam && teams ? (
              <Select
                error={formState.errors['teamId']}
                label="Team"
                options={teams?.map((team) => ({
                  label: team.name,
                  value: team.id,
                }))}
                registration={register('teamId')}
              />
            ) : (
              <Input
                error={formState.errors['teamName']}
                label="Team Name"
                registration={register('teamName')}
                type="text"
              />
            )}
            <div>
              <Button
                className="w-full"
                isLoading={registering.isPending}
                type="submit"
              >
                Register
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <NextLink
            className="font-medium text-blue-600 hover:text-blue-500"
            href={paths.auth.login.getHref(redirectTo)}
          >
            Log In
          </NextLink>
        </div>
      </div>
    </div>
  )
}
