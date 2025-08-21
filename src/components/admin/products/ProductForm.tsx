import { api } from '@/_generated/api';
import type { Doc, Id } from '@/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConvexMutation } from '@convex-dev/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMutation as useCMutation } from 'convex/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.number().positive('Must be > 0'),
  category: z.string().min(1, 'Required'),
});
type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row?: Doc<'products'>; // existing product (edit mode)
  categories: Doc<'categories'>[];
}

export function ProductForm({ open, onOpenChange, row, categories }: Props) {
  const queryClient = useQueryClient();

  /* ---------- 1. Convex mutations ---------- */
  const generateUploadUrl = useCMutation(api.image.generateUploadUrl);

  const addProduct = useMutation({
    mutationFn: useConvexMutation(api.products.addProduct),
  });
  const updateProduct = useMutation({
    mutationFn: useConvexMutation(api.products.updateProduct),
  });
  const upsertCategory = useMutation({
    mutationFn: useConvexMutation(api.categories.addCategory),
  });

  /* ---------- 2. Local state ---------- */
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [mode, setMode] = useState<'select' | 'create'>('select');

  /* ---------- 3. Form ---------- */
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: row
      ? { name: row.name, price: row.price, category: row.category }
      : { name: '', price: 0, category: '' },
  });

  /* ---------- 4. Upload + Save ---------- */
  const onSubmit = async (values: ProductFormValues) => {
    if (!file && !row) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      let storageId = row?.image ?? '';

      /* 4a. Upload image (only if new file) */
      if (file) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const json = await res.json();
        storageId = json.storageId;
      }

      /* 4b. Save product */
      const payload = { ...values, image: storageId };
      row
        ? await updateProduct.mutateAsync({
            id: row._id,
            ...payload,
            category: values.category as Id<'categories'>,
          })
        : await addProduct.mutateAsync({
            ...payload,
            category: values.category as Id<'categories'>,
          });

      toast.success(row ? 'Updated' : 'Created');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      form.reset();
      setFile(null);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row ? 'Edit' : 'Add'} Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Product name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </FormControl>
              {file && (
                <p className='text-sm text-muted-foreground'>{file.name}</p>
              )}
            </FormItem>

            {/* Category */}
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>

                  <div className='flex items-center gap-2 mb-2'>
                    <Button
                      type='button'
                      size='sm'
                      variant={mode === 'select' ? 'default' : 'outline'}
                      onClick={() => setMode('select')}
                    >
                      Select
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      variant={mode === 'create' ? 'default' : 'outline'}
                      onClick={() => setMode('create')}
                    >
                      New
                    </Button>
                  </div>

                  {mode === 'select' ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pick a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className='flex gap-2'>
                      <Input
                        placeholder='New category name'
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                      />
                      <Button
                        type='button'
                        size='sm'
                        disabled={!newCat.trim()}
                        onClick={async () => {
                          const id = await upsertCategory.mutateAsync({
                            name: newCat.trim(),
                          });
                          field.onChange(id);
                          setNewCat('');
                          setMode('select');
                        }}
                      >
                        {upsertCategory.isPending ? 'Adding…' : 'Add'}
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={uploading}>
                {uploading ? 'Uploading…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
