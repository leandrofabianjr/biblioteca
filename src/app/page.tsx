import { ROUTES } from '@/lib/routes';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  redirect(ROUTES.loggedUser.root());
}
