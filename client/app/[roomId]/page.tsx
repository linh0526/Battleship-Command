import { redirect } from 'next/navigation';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  // Simple server-side redirect to proper query param handling on home page
  redirect(`/?room=${params.roomId}`);
}
