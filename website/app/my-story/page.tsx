import { permanentRedirect } from 'next/navigation';

// Retired: the About page is now the canonical story.
// 308 permanent redirect preserves SEO from the old URL.
export default function MyStoryPage() {
  permanentRedirect('/about');
}
