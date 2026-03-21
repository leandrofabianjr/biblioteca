'use client';

import { useColorMode } from '@/components/ui/color-mode';
import { googleSignIn, useSession } from '@/lib/auth/auth-client';
import { ROUTES } from '@/lib/routes';
import { Box, Button, Card, Image, Skeleton, Text } from '@chakra-ui/react';
import { redirect } from 'next/navigation';

export default function Login() {
  const { isPending, data } = useSession();

  if (!isPending && data) {
    redirect(ROUTES.loggedUser.root());
  }

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card.Root minW="300px">
        <Card.Header flexDir="row" alignItems="center" gap="4" mb="4">
          <Image
            w="10"
            h="10"
            src="/favicon.ico"
            alt="Logo"
            borderRadius="md"
          />
          <Card.Title>Biblioteca</Card.Title>
        </Card.Header>
        <Card.Body>
          {isPending ? (
            <>
              <Skeleton height="20px" />
              <Text>Verificando sessão</Text>
            </>
          ) : (
            <Button onClick={() => googleSignIn()}>Entrar</Button>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
