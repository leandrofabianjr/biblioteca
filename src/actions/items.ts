"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getItems() {
  const items = await db.item.findMany({
    include: {
      location: {
        select: { description: true },
      },
      item_authors: {
        include: {
          author: { select: { name: true } },
        },
      },
      item_genres: {
        include: {
          genre: { select: { uuid: true, description: true } },
        },
      },
      item_publishers: {
        include: {
          publisher: { select: { name: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

// Tipagem para os itens que vêm do formulário
export type SelectOption = {
  uuid?: string;
  name: string;
  isNew: boolean;
};

export interface CreateItemPayload {
  description: string;
  year: number;
  location: SelectOption | null;
  authors: SelectOption[];
  genres: SelectOption[];
  publishers: SelectOption[];
}

export async function createLibraryItem(data: CreateItemPayload) {
  try {
    await db.item.create({
      data: {
        description: data.description,
        year: data.year,

        // 1. Localização (Relação 1-para-N direta na tabela item)
        ...(data.location && {
          location: data.location.isNew
            ? { create: { description: data.location.name } }
            : { connect: { uuid: data.location.uuid } },
        }),

        // 2. Autores (Relação N-para-N usando tabela intermediária)
        item_authors: {
          create: data.authors.map((author) =>
            author.isNew
              ? { author: { create: { name: author.name } } }
              : { author: { connect: { uuid: author.uuid } } },
          ),
        },

        // 3. Gêneros (Atenção: o campo no schema é 'description', não 'name')
        item_genres: {
          create: data.genres.map((genre) =>
            genre.isNew
              ? { genre: { create: { description: genre.name } } }
              : { genre: { connect: { uuid: genre.uuid } } },
          ),
        },

        // 4. Editoras
        item_publishers: {
          create: data.publishers.map((pub) =>
            pub.isNew
              ? { publisher: { create: { name: pub.name } } }
              : { publisher: { connect: { uuid: pub.uuid } } },
          ),
        },
      },
    });

    // Atualiza a listagem da biblioteca
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return { success: false, error: "Falha ao cadastrar o item." };
  }
}
