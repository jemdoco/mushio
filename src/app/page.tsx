import { redirect } from 'next/navigation';

export default function Page() {
  // Make the learning pathway the home screen
  redirect('/lessons/path');
}

