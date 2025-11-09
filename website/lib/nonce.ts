import { headers } from 'next/headers';

/**
 * Get the CSP nonce from middleware
 *
 * The nonce is generated in middleware.ts and passed via the x-nonce header.
 * This function retrieves it for use in React Server Components.
 *
 * Usage:
 * ```tsx
 * import { getNonce } from '@/lib/nonce';
 *
 * export default async function MyComponent() {
 *   const nonce = await getNonce();
 *
 *   return (
 *     <script nonce={nonce}>
 *       // Inline script here
 *     </script>
 *   );
 * }
 * ```
 *
 * @returns The CSP nonce for the current request
 */
export async function getNonce(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-nonce') || '';
}
