'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldShapeLearningPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/teaching-tools/fun-learning'); }, [router]);
  return null;
}
