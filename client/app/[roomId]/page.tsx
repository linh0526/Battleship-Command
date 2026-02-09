import { redirect, notFound } from 'next/navigation';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  // Validate roomId: Must be exactly 4 digits
  const isNumeric = /^\d{4}$/.test(roomId);
  
  if (!isNumeric) {
    notFound();
    return null;
  }

  // Always redirect to home page and let the client-side SocketContext 
  // handle the actual joining logic and any "Room not found" errors via toast.
  redirect(`/?room=${roomId}`);
}
