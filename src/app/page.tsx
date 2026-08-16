import { formatDate, getStatusText } from '@/lib/utils';
import { getNextActivity } from '@/lib/server-utils';
import { Card } from '@/components/Card';
import { NavButton } from '@/components/NavButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const nextActivity = await getNextActivity();

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black text-white">
      {/* rest blijft hetzelfde */}
    </main>
  );
}
