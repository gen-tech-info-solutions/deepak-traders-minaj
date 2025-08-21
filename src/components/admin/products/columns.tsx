import { api } from '@/_generated/api';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FunctionReturnType } from 'convex/server';

type ProductRow = FunctionReturnType<
  typeof api.products.listProducts
>['page'][number];

const columnHelper = createColumnHelper<ProductRow>();

export const columns = (
  onEdit: (row: ProductRow) => void,
  onDelete: (id: string) => void,
) => [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('image', {
    header: 'Image',
    cell: (info) => {
      const src = info.getValue();
      // 2️⃣  Guard against null
      return src ? (
        <img src={src} alt='' className='h-8 w-8 rounded object-cover' />
      ) : null;
    },
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <span className='sr-only'>Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original._id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];
