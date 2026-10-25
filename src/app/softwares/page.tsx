import { permanentRedirect } from 'next/navigation';

// The software hub moved to The Master Store. next.config.ts also redirects
// /softwares → /store; this is a fallback in case the config redirect is removed.
export default function SoftwaresRedirect() {
  permanentRedirect('/the-master-store');
}
