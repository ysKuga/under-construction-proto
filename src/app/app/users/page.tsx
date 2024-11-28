import { ContentLayout } from '@/components/layouts/content-layout';

import { AdminGuard } from './_components/admin-guard';
import { Users } from './_components/users';

export const metadata = {
  description: 'Users',
  title: 'Users',
};

const UsersPage = () => {
  return (
    <ContentLayout title="Users">
      <AdminGuard>
        <Users />
      </AdminGuard>
    </ContentLayout>
  );
};

export default UsersPage;
