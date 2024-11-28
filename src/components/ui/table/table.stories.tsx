import { Meta, StoryObj } from '@storybook/react';

import { Table } from './table';

const meta: Meta<typeof Table> = {
  component: Table,
};

export default meta;

type User = {
  createdAt: number;
  email: string;
  id: string;
  name: string;
  role: string;
  title: string;
};

type Story = StoryObj<typeof Table<User>>;

const data: User[] = [
  {
    createdAt: Date.now(),
    email: 'jane.cooper@example.com',
    id: '1',
    name: 'Jane Cooper',
    role: 'Admin',
    title: 'Regional Paradigm Technician',
  },
  {
    createdAt: Date.now(),
    email: 'cody.fisher@example.com',
    id: '2',
    name: 'Cody Fisher',
    role: 'Owner',
    title: 'Product Directives Officer',
  },
];

export const Default: Story = {
  args: {
    columns: [
      {
        field: 'name',
        title: 'Name',
      },
      {
        field: 'title',
        title: 'Title',
      },
      {
        field: 'role',
        title: 'Role',
      },
      {
        field: 'email',
        title: 'Email',
      },
    ],
    data,
  },
};
