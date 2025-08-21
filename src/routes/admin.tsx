import { api } from '@/_generated/api';
import { AdminProduct } from '@/components/admin/products/AdminProduct';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const adminSearchSchema = z.object({
  tab: fallback(z.enum(['products', 'orders']), 'products').default('products'),
});

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (context.userId === undefined) {
      throw redirect({ to: '/' });
    }

    const user = await context.queryClient.ensureQueryData(
      convexQuery(api.auth.getCurrentUser, {}),
    );

    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  validateSearch: zodValidator(adminSearchSchema),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { tab } = Route.useSearch();

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-6 space-y-8'>
      <Tabs
        value={tab}
        onValueChange={(newTab) => {
          navigate({ search: { tab: newTab } });
        }}
      >
        <TabsList className='grid w-full md:w-[400px] grid-cols-2 mb-6'>
          <TabsTrigger value='products'>Products</TabsTrigger>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
        </TabsList>

        <TabsContent value='products'>
          <AdminProduct />
        </TabsContent>

        <TabsContent value='orders'>
          <div>Order</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
