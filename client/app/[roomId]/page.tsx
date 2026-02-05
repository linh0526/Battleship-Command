import { redirect } from 'next/navigation';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  // Simple server-side redirect to proper query param handling on home page
  redirect(`/?room=${roomId}`);
}
