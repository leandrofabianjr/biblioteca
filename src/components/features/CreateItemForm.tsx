'use client';

import { createItemForLoggedUser, SelectOption } from '@/actions/items';
import { toaster } from '@/components/ui/toaster';
import { Button, Field, Input, VStack } from '@chakra-ui/react';
import { useState, useTransition } from 'react';
import { TagsComboboxInput } from '../ui/TagsComboboxInput';

// --- COMPONENTE PRINCIPAL DO FORMULÁRIO ---
interface FormProps {
  dbAuthors: { id: string; name: string }[];
  dbGenres: { id: string; name: string }[];
  dbPublishers: { id: string; name: string }[];
  dbLocations: { id: string; name: string }[];
}

export default function CreateItemForm({
  dbAuthors,
  dbGenres,
  dbPublishers,
  dbLocations,
}: FormProps) {
  const [isPending, startTransition] = useTransition();

  // Estados dos campos nativos
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');

  // Estados dos campos relacionais
  const [authors, setAuthors] = useState<SelectOption[]>([]);
  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [publishers, setPublishers] = useState<SelectOption[]>([]);
  const [location, setLocation] = useState<SelectOption[]>([]);

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
        location: location[0],
        authors,
        genres,
        publishers,
      };

      const result = await createItemForLoggedUser(payload);

      if (result.success) {
        toaster.create({
          title: 'Livro cadastrado com sucesso!',
          type: 'success',
        });
        // Limpar formulário
        setDescription('');
        setYear('');
        setAuthors([]);
        setGenres([]);
        setPublishers([]);
        setLocation([]);
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
          Salvar no Acervo
        </Button>
      </VStack>
    </form>
  );
}
