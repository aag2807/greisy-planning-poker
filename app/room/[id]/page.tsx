import type { Metadata } from 'next';
import RoomClient from '@/components/RoomClient';
import BackgroundEffects from '@/components/BackgroundEffects';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Room ${id} | Greisy's Planning Poker`,
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen">
      <BackgroundEffects />
      <RoomClient roomId={id} />
    </main>
  );
}
