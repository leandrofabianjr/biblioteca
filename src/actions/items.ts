"use server";

import { db } from "@/lib/db";
import { ROUTES } from "@/lib/routes";
import { User } from "better-auth";
import { revalidatePath } from "next/cache";
import { clientAction } from "./_base";

export async function getItems(searchParams: { ownerId: string; q?: string; page?: string, itemsPerPage: number }) {
  const currentPage = Number(searchParams?.page) || 1;
  const searchQuery = searchParams?.q || '';
  const skip = (currentPage - 1) * searchParams.itemsPerPage;

  // Constrói a cláusula de busca para o Prisma se houver termo de pesquisa
  const whereClause = {
    ownerId: searchParams.ownerId,
    deletedAt: null,
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
      take: searchParams.itemsPerPage,
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

  return { currentPage, items, totalItems };
}

// Tipagem para os itens que vêm do formulário

export type SelectOption =
  | { isNew: true; name: string; id?: string } // Se é novo, ID é opcional
  | { isNew: false; name: string; id: string }; // Se não é novo, ID é OBRIGATÓRIO

export interface CreateItemPayload {
  description: string;
  year: number;
  location: SelectOption | null;
  authors: SelectOption[];
  genres: SelectOption[];
  publishers: SelectOption[];
}

export async function createItemClientAction(data: CreateItemPayload) {
  return await clientAction(async ({ user }) => createLibraryItem(user, data));
}

export async function createLibraryItem({ id: ownerId }: User, data: CreateItemPayload) {

  await db.item.create({
    data: {
      description: data.description,
      year: data.year,

      owner: { connect: { id: ownerId } },

      // 1. Localização (Relação 1-para-N direta na tabela item)
      location: !data.location ? undefined : data.location.isNew
        ? { create: { ownerId, description: data.location.name } }
        : { connect: { id: data.location.id } },

      // 2. Autores (Relação N-para-N usando tabela intermediária)
      item_authors: {
        create: data.authors.map((author) =>
          author.isNew
            ? { author: { create: { ownerId, name: author.name } } }
            : { author: { connect: { id: author.id } } },
        ),
      },

      // 3. Gêneros (Atenção: o campo no schema é 'description', não 'name')
      item_genres: {
        create: data.genres.map((genre) =>
          genre.isNew
            ? { genre: { create: { ownerId, description: genre.name } } }
            : { genre: { connect: { id: genre.id } } },
        ),
      },

      // 4. Editoras
      item_publishers: {
        create: data.publishers.map((pub) =>
          pub.isNew
            ? { publisher: { create: { ownerId, name: pub.name } } }
            : { publisher: { connect: { id: pub.id } } },
        ),
      },
    },
  });
}

export async function updateItemClientAction(itemId: string, data: CreateItemPayload) {
  return await clientAction(async ({ user }) => updateLibraryItem(user, itemId, data));
}

export async function updateLibraryItem({ id: ownerId }: User, itemId: string, data: CreateItemPayload) {
  // 1. Segurança: Verifica se o item existe e pertence ao usuário logado
  const existingItem = await db.item.findUnique({
    where: { id: itemId },
    select: { ownerId: true },
  });

  if (!existingItem || existingItem.ownerId !== ownerId) {
    throw new Error("Item não encontrado ou acesso negado.");
  }

  // 2. Faz a atualização
  await db.item.update({
    where: { id: itemId },
    data: {
      description: data.description,
      year: data.year,

      // 1. Localização (Relação 1-para-N direta)
      // Se vier null, desconecta. Se tiver dado, cria ou conecta.
      location: !data.location
        ? { disconnect: true }
        : data.location.isNew
          ? { create: { ownerId, description: data.location.name } }
          : { connect: { id: data.location.id } },

      // 2. Autores (Relação N-para-N explícita)
      item_authors: {
        deleteMany: {}, // <--- Remove todos os vínculos de autores antigos
        create: data.authors.map((author) =>
          author.isNew
            ? { author: { create: { ownerId, name: author.name } } }
            : { author: { connect: { id: author.id } } },
        ),
      },

      // 3. Gêneros
      item_genres: {
        deleteMany: {}, // <--- Remove todos os vínculos de gêneros antigos
        create: data.genres.map((genre) =>
          genre.isNew
            ? { genre: { create: { ownerId, description: genre.name } } }
            : { genre: { connect: { id: genre.id } } },
        ),
      },

      // 4. Editoras
      item_publishers: {
        deleteMany: {}, // <--- Remove todos os vínculos de editoras antigas
        create: data.publishers.map((pub) =>
          pub.isNew
            ? { publisher: { create: { ownerId, name: pub.name } } }
            : { publisher: { connect: { id: pub.id } } },
        ),
      },
    },
  });
}

// Recebe o ID do item que será excluído
export async function deleteItemForLoggedUser(itemId: string) {
  return await clientAction(async ({ user }) => {
    try {
      // Segurança: Verifica se o item existe e pertence a este usuário
      const item = await db.item.findUnique({
        where: { id: itemId, ownerId: user.id },
      });

      if (!item) {
        throw new Error("Item não encontrado ou você não tem permissão.");
      }

      // Soft Delete: Atualiza o campo deletedAt com a data atual
      await db.item.update({
        where: { id: itemId },
        data: {
          deletedAt: new Date(),
        },
      });

      // Atualiza a listagem na tela
      revalidatePath(ROUTES.loggedUser.items.root());

      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      return { success: false, error: "Falha ao excluir o item." };
    }
  });
}