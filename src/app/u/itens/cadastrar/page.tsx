import ItemForm from '@/components/features/ItemForm';
import { loggedUser } from '@/lib/auth/auth-session';
import { db } from '@/lib/db';
import { Box, Heading } from '@chakra-ui/react';

export default async function Page() {
  const { id: ownerId } = await loggedUser();
  // Busca todos os dados em paralelo para alimentar as sugestões do formulário
  const [authors, genres, publishers, locations] = await Promise.all([
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

  return (
    <main>
      <Box maxW="7xl" mx="auto" p={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6}>
          Cadastrar Novo Item
        </Heading>
        <ItemForm
          dbAuthors={authors}
          dbGenres={formattedGenres}
          dbPublishers={publishers}
          dbLocations={formattedLocations}
        />
      </Box>
    </main>
  );
}
