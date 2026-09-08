'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';

// Warm only the destination the visitor is about to open, not an entire catalog.
export function IntentLink({ onMouseEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const warm = () => {
    if (typeof props.href === 'string' && props.href.startsWith('/') && !props.href.startsWith('//')) router.prefetch(props.href);
  };
  return <Link {...props}
    onMouseEnter={event => { onMouseEnter?.(event); if (!event.defaultPrevented) warm(); }}
    onFocus={event => { onFocus?.(event); if (!event.defaultPrevented) warm(); }}
    onTouchStart={event => { onTouchStart?.(event); if (!event.defaultPrevented) warm(); }}
  />;
}
