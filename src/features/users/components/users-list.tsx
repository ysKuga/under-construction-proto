'use client';

import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { formatDate } from '@/utils/format';

import { useUsers } from '../api/get-users';

import { DeleteUser } from './delete-user';

export const UsersList = () => {
  const usersQuery = useUsers();

  if (usersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const users = usersQuery.data?.data;

  if (!users) return null;

  return (
    <Table
      columns={[
        {
          field: 'firstName',
          title: 'First Name',
        },
        {
          field: 'lastName',
          title: 'Last Name',
        },
        {
          field: 'email',
          title: 'Email',
        },
        {
          field: 'role',
          title: 'Role',
        },
        {
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
          field: 'createdAt',
          title: 'Created At',
        },
        {
          Cell({ entry: { id } }) {
            return <DeleteUser id={id} />;
          },
          field: 'id',
          title: '',
        },
      ]}
      data={users}
    />
  );
};
