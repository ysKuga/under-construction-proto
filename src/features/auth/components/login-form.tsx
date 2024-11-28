'use client';

import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { loginInputSchema, useLogin } from '@/lib/auth';

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useLogin({
    onSuccess,
  });

  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');
  return (
    <div>
      <Form
        onSubmit={(values) => {
          login.mutate(values);
        }}
        schema={loginInputSchema}
      >
        {({ formState, register }) => (
          <>
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
            <div>
              <Button
                className="w-full"
                isLoading={login.isPending}
                type="submit"
              >
                Log in
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <NextLink
            className="font-medium text-blue-600 hover:text-blue-500"
            href={paths.auth.register.getHref(redirectTo)}
          >
            Register
          </NextLink>
        </div>
      </div>
    </div>
  );
};
