import ItemForm from '@/components/features/ItemForm';
import { loggedUser } from '@/lib/auth/auth-session';
import { db } from '@/lib/db';
import { Box, Heading } from '@chakra-ui/react';

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: itemId } = await params;
  const { id: ownerId } = await loggedUser();
  // Busca todos os dados em paralelo para alimentar as sugestões do formulário
  const [dbAuthors, genres, dbPublishers, locations] = await Promise.all([
    db.author.findMany({
      where: { ownerId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.genre.findMany({
      where: { ownerId },
      select: { id: true, description: true },
      orderBy: { description: 'asc' },
    }),
    db.publisher.findMany({
      where: { ownerId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.location.findMany({
      where: { ownerId },
      select: { id: true, description: true },
      orderBy: { description: 'asc' },
    }),
  ]);

  // Normalizando o gênero e localização para terem o campo "name" que o componente espera
  const formattedGenres = genres.map((g) => ({
    id: g.id,
    name: g.description,
  }));
  const formattedLocations = locations.map((l) => ({
    id: l.id,
    name: l.description,
  }));

  // 2. Busca o item específico do banco de dados com seus relacionamentos
  const item = await db.item.findUnique({
    where: { id: itemId },
    include: {
      location: true,
      item_authors: { include: { author: true } },
      item_genres: { include: { genre: true } },
      item_publishers: { include: { publisher: true } },
    },
  });

  if (!item) return <div>Item não encontrado.</div>;

  // 3. Mapeia os dados do banco para o formato 'SelectOption' que o form espera
  const initialData = {
    id: item.id,
    description: item.description,
    year: item.year,
    location: item.location
      ? [
          {
            id: item.location.id,
            name: item.location.description,
            isNew: false,
          },
        ]
      : [],
    authors: item.item_authors.map((ia) => ({
      id: ia.author.id,
      name: ia.author.name,
      isNew: false,
    })),
    genres: item.item_genres.map((ig) => ({
      id: ig.genre.id,
      name: ig.genre.description,
      isNew: false,
    })),
    publishers: item.item_publishers.map((ip) => ({
      id: ip.publisher.id,
      name: ip.publisher.name,
      isNew: false,
    })),
  };

  return (
    <main>
      <Box maxW="7xl" mx="auto" p={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6}>
          Editar item
        </Heading>
        <ItemForm
          dbAuthors={dbAuthors}
          dbGenres={formattedGenres}
          dbPublishers={dbPublishers}
          dbLocations={formattedLocations}
          initialData={initialData}
        />
      </Box>
    </main>
  );
}
