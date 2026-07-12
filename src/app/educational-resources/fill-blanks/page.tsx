'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldFillBlanksPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/educational-resources/fun-learning'); }, [router]);
  return null;
}
