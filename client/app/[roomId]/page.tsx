import { redirect, notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  try {
    const res = await fetch(`${API_URL}/api/room/exists/${roomId}`, { cache: 'no-store' });
    const data = await res.json();
    
    if (!data.exists) {
      notFound();
    }
  } catch (e) {
    console.error('Room check failed:', e);
    // On error, better to go to lobby than show broken page
    redirect('/');
  }

  // Simple server-side redirect to proper query param handling on home page
  redirect(`/?room=${roomId}`);
}
