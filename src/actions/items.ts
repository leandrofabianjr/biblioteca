"use server";

import { db } from "@/lib/db";
import { User } from "better-auth";
import { clientAction } from "./_base";

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
          genre: { select: { id: true, description: true } },
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

export async function createItemForLoggedUser(data: CreateItemPayload) {
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
