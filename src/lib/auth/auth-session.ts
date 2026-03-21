"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type AuthSessionType = NonNullable<Awaited<ReturnType<typeof authSession>>>;

export async function authSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session;
};

export async function loggedUser() {
  const session = await authSession();
  if (!session) {
    throw new Error('Não autenticado');
  }
  return session.user;
}