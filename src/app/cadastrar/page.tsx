import CreateItemForm from "@/components/features/CreateItemForm";
import { db } from "@/lib/db";
import { Container, Heading } from "@chakra-ui/react";

export default async function Page() {
  // Busca todos os dados em paralelo para alimentar as sugestões do formulário
  const [authors, genres, publishers, locations] = await Promise.all([
    db.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.genre.findMany({
      select: { id: true, description: true },
      orderBy: { description: "asc" },
    }),
    db.publisher.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.location.findMany({
      select: { id: true, description: true },
      orderBy: { description: "asc" },
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
    <Container my={8}>
      <Heading size="lg" mb={6}>
        Cadastrar Novo Item
      </Heading>
      <CreateItemForm
        dbAuthors={authors}
        dbGenres={formattedGenres}
        dbPublishers={publishers}
        dbLocations={formattedLocations}
      />
    </Container>
  );
}
