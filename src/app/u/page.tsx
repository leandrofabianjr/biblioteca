import { ROUTES } from '@/lib/routes';
import { redirect } from 'next/navigation';

export default async function ItemsPage() {
  redirect(ROUTES.loggedUser.items.root());
}
