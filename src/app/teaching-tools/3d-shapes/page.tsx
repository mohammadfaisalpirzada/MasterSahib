'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldShapes3DPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/teaching-tools/fun-learning'); }, [router]);
  return null;
}
