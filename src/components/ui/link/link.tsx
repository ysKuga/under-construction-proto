import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import { cn } from '@/utils/cn';

export type LinkProps = {
  children: React.ReactNode;
  className?: string;
  target?: string;
} & NextLinkProps;

export const Link = ({ children, className, href, ...props }: LinkProps) => {
  return (
    <NextLink
      className={cn('text-slate-600 hover:text-slate-900', className)}
      href={href}
      {...props}
    >
      {children}
    </NextLink>
  );
};
