'use client';

import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();


export const googleSignIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });

  return data;
};

export const signOut = async ({ onSuccess }: { onSuccess: () => void }) => {
  await authClient.signOut({
    fetchOptions: { onSuccess },
  });
};

export const { useSession } = authClient;