// app/(private)/loading.tsx
import { Center, Spinner } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Center h="100vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}
