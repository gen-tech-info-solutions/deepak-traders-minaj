import { api } from '@/_generated/api';
import { Doc, Id } from '@/_generated/dataModel';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from 'convex/react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { ProductForm } from './ProductForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AdminProduct() {
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Doc<'products'> | undefined>();

  const { results: products = [] } = usePaginatedQuery(
    api.products.listProducts,
    {},
    { initialNumItems: 100 },
  );

  const categories = useQuery(convexQuery(api.categories.listCategories, {}));

  const deleteProduct = useMutation({
    mutationFn: useConvexMutation(api.products.deleteProduct),
  });

  const openEdit = (p: Doc<'products'>) => {
    setEditingRow(p);
    setOpen(true);
  };

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Products</h1>
        <Button onClick={() => setOpen(true)}>Add Product</Button>
      </div>

      {/* TanStack Table with live subscription */}
      <DataTable
        columns={columns(openEdit, (id) =>
          deleteProduct.mutate({ id: id as Id<'products'> }),
        )}
        data={products ?? []}
        searchKey='name'
        meta={{ categories }}
      />
      <ProductForm
        open={open}
        onOpenChange={setOpen}
        row={editingRow}
        categories={categories.data ?? []}
      />
    </div>
  );
}
