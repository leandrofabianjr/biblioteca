import ItemsList from '@/components/features/ItemsList';
import { loggedUser } from '@/lib/auth/auth-session';
import { db } from '@/lib/db';
import { ROUTES } from '@/lib/routes';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12; // Número de itens por página

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await loggedUser();
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const searchQuery = resolvedParams?.q || '';
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Constrói a cláusula de busca para o Prisma se houver termo de pesquisa
  const whereClause = {
    ownerId: user.id,
    ...(searchQuery
      ? {
          OR: [
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive' as const,
              },
            },
            {
              location: {
                description: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              item_authors: {
                some: {
                  author: {
                    name: {
                      contains: searchQuery,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
            },
            {
              item_genres: {
                some: {
                  genre: {
                    description: {
                      contains: searchQuery,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
            },
            {
              item_publishers: {
                some: {
                  publisher: {
                    name: {
                      contains: searchQuery,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  // Executa a busca e a contagem total em paralelo para melhor performance
  const [items, totalItems] = await Promise.all([
    db.item.findMany({
      where: {
        ...whereClause,
      },
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        location: { select: { description: true } },
        item_authors: { include: { author: { select: { name: true } } } },
        item_genres: {
          include: { genre: { select: { id: true, description: true } } },
        },
        item_publishers: { include: { publisher: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.item.count({ where: whereClause }),
  ]);

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
