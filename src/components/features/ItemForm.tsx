'use client';

import {
  createItemClientAction,
  SelectOption,
  updateItemClientAction,
} from '@/actions/items';
import { toaster } from '@/components/ui/toaster';
import { ROUTES } from '@/lib/routes';
import { Button, Field, Input, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { TagsComboboxInput } from '../ui/TagsComboboxInput';

// Define o formato dos dados que vêm do banco para popular a edição
export interface ItemInitialData {
  id: string;
  description: string;
  year: number;
  authors: SelectOption[];
  genres: SelectOption[];
  publishers: SelectOption[];
  location: SelectOption[]; // Pode vir vazio ou com 1 item
}

interface ItemFormProps {
  dbAuthors: { id: string; name: string }[];
  dbGenres: { id: string; name: string }[];
  dbPublishers: { id: string; name: string }[];
  dbLocations: { id: string; name: string }[];
  // Se initialData for passado, o formulário entra no modo "Edição"
  initialData?: ItemInitialData;
}

export default function ItemForm({
  dbAuthors,
  dbGenres,
  dbPublishers,
  dbLocations,
  initialData,
}: ItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // O modo de edição é ativado se initialData.id existir
  const isEditing = !!initialData?.id;

  // Estados dos campos nativos (inicializa com os dados ou vazio)
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [year, setYear] = useState(initialData?.year?.toString() || '');

  // Estados dos campos relacionais (inicializa com os dados ou vazio)
  const [authors, setAuthors] = useState<SelectOption[]>(
    initialData?.authors || [],
  );
  const [genres, setGenres] = useState<SelectOption[]>(
    initialData?.genres || [],
  );
  const [publishers, setPublishers] = useState<SelectOption[]>(
    initialData?.publishers || [],
  );
  const [location, setLocation] = useState<SelectOption[]>(
    initialData?.location || [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !year) {
      toaster.create({ title: 'Preencha o título e o ano.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const payload = {
        description,
        year: parseInt(year),
        location: location[0] || null, // Garante que mande null se esvaziar a localização
        authors,
        genres,
        publishers,
      };

      let result;

      if (isEditing) {
        result = await updateItemClientAction(initialData.id, payload);
      } else {
        result = await createItemClientAction(payload);
      }

      if (result.success) {
        toaster.create({
          title: isEditing
            ? 'Livro atualizado com sucesso!'
            : 'Livro cadastrado com sucesso!',
          type: 'success',
        });

        if (!isEditing) {
          setDescription('');
          setYear('');
          setAuthors([]);
          setGenres([]);
          setPublishers([]);
          setLocation([]);
        }

        router.push(ROUTES.loggedUser.items.root());
      } else {
        toaster.create({ title: JSON.stringify(result.error), type: 'error' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={5} align="stretch">
        <Field.Root>
          <Field.Label fontWeight="bold">Título / Descrição</Field.Label>
          <Input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: O Senhor dos Anéis"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontWeight="bold">Ano de Publicação</Field.Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ex: 1954"
          />
        </Field.Root>

        <TagsComboboxInput
          label="Autores (Vários)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbAuthors}
          selected={authors}
          onChange={setAuthors}
        />

        <TagsComboboxInput
          label="Gêneros (Vários)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbGenres}
          selected={genres}
          onChange={setGenres}
        />

        <TagsComboboxInput
          label="Editoras (Várias)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbPublishers}
          selected={publishers}
          onChange={setPublishers}
        />

        <TagsComboboxInput
          label="Localização Física (Única)"
          placeholder="Onde o livro está guardado?"
          existingOptions={dbLocations}
          selected={location}
          onChange={setLocation}
          singleMode={true}
        />

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          mt={4}
          loading={isPending}
          loadingText="Salvando..."
        >
          {isEditing ? 'Salvar Alterações' : 'Salvar no Acervo'}
        </Button>
      </VStack>
    </form>
  );
}
