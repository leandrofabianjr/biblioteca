import { loggedUserAction } from '@/actions/_base';
import { getItems } from '@/actions/items';
import ItemsList from '@/components/features/ItemsList';
import { ROUTES } from '@/lib/routes';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12; // Número de itens por página

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const action = await loggedUserAction(async ({ user: { id: ownerId } }) =>
    getItems({ ownerId, itemsPerPage: ITEMS_PER_PAGE, ...params }),
  );

  if (action.error) {
    return (
      <main>
        <Box maxW="7xl" mx="auto" p={{ base: 4, md: 8 }}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Box flex="1" />
            <Heading as="h1" mb={6} textAlign="center">
              Biblioteca
            </Heading>
            <Flex flex="1" justifyContent="flex-end">
              <Button asChild>
                <Link href={ROUTES.loggedUser.items.create()}>Cadastrar</Link>
              </Button>
            </Flex>
          </Flex>
          <p>{JSON.stringify(action.error)}</p>
        </Box>
      </main>
    );
  }

  const { items, totalItems, currentPage } = action.data!;
  // Sanitização
  const formattedItems = items.map((item) => ({
    id: item.id,
    description: item.description,
    year: item.year,
    location: item.location ? { description: item.location.description } : null,
    item_authors: item.item_authors.map((ia) => ({
      author: { name: ia.author.name },
    })),
    item_genres: item.item_genres.map((ig) => ({
      genre: { id: ig.genre.id, description: ig.genre.description },
    })),
    item_publishers: item.item_publishers.map((ip) => ({
      publisher: { name: ip.publisher.name },
    })),
  }));

  return (
    <main>
      <Box maxW="7xl" mx="auto" p={{ base: 4, md: 8 }}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Box flex="1" />
          <Heading as="h1" mb={6} textAlign="center">
            Biblioteca
          </Heading>
          <Flex flex="1" justifyContent="flex-end">
            <Button asChild>
              <Link href={ROUTES.loggedUser.items.create()}>Cadastrar</Link>
            </Button>
          </Flex>
        </Flex>
        <ItemsList
          initialItems={formattedItems}
          itemsCount={totalItems}
          currentPage={currentPage}
          pageSize={ITEMS_PER_PAGE}
        />
      </Box>
    </main>
  );
}
