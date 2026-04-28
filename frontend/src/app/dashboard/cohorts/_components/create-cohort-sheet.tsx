'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { createCohort } from '../_actions';

export function CreateCohortSheet() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createCohort(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>+ 기수 추가</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>새 기수 등록</SheetTitle>
          <SheetDescription>새 교육 기수를 등록합니다.</SheetDescription>
        </SheetHeader>
        <form action={onSubmit} className='grid gap-4 px-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>기수 이름</Label>
            <Input id='name' name='name' required placeholder='25-1기' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='started_at'>시작일 (선택)</Label>
            <Input id='started_at' name='started_at' type='date' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='ended_at'>종료일 (선택)</Label>
            <Input id='ended_at' name='ended_at' type='date' />
          </div>
          {error && <div className='text-destructive text-sm'>{error}</div>}
          <SheetFooter>
            <Button type='submit' disabled={pending}>
              {pending ? '등록 중...' : '등록'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
