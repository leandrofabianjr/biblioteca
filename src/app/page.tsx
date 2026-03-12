import LibraryList from "@/components/features/LibraryList";
import { db } from "@/lib/db";

const ITEMS_PER_PAGE = 12; // Número de itens por página

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const searchQuery = resolvedParams?.q || "";
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Constrói a cláusula de busca para o Prisma se houver termo de pesquisa
  const whereClause = searchQuery
    ? {
        OR: [
          {
            description: {
              contains: searchQuery,
              mode: "insensitive" as const,
            },
          },
          {
            location: {
              description: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          },
          {
            item_authors: {
              some: {
                author: {
                  name: { contains: searchQuery, mode: "insensitive" as const },
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
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          },
          {
            item_publishers: {
              some: {
                publisher: {
                  name: { contains: searchQuery, mode: "insensitive" as const },
                },
              },
            },
          },
        ],
      }
    : {};

  // Executa a busca e a contagem total em paralelo para melhor performance
  const [items, totalItems] = await Promise.all([
    db.item.findMany({
      where: whereClause,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        location: { select: { description: true } },
        item_authors: { include: { author: { select: { name: true } } } },
        item_genres: {
          include: { genre: { select: { uuid: true, description: true } } },
        },
        item_publishers: { include: { publisher: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.item.count({ where: whereClause }),
  ]);

  // Sanitização
  const formattedItems = items.map((item) => ({
    uuid: item.uuid,
    description: item.description,
    year: item.year,
    location: item.location ? { description: item.location.description } : null,
    item_authors: item.item_authors.map((ia) => ({
      author: { name: ia.author.name },
    })),
    item_genres: item.item_genres.map((ig) => ({
      genre: { uuid: ig.genre.uuid, description: ig.genre.description },
    })),
    item_publishers: item.item_publishers.map((ip) => ({
      publisher: { name: ip.publisher.name },
    })),
  }));

  return (
    <main>
      <LibraryList
        initialItems={formattedItems}
        itemsCount={totalItems}
        currentPage={currentPage}
        pageSize={ITEMS_PER_PAGE}
      />
    </main>
  );
}
