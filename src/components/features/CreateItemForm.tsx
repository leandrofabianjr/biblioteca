// components/CreateItemForm.tsx
"use client";

import { createLibraryItem, SelectOption } from "@/actions/items";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  CloseButton,
  Field,
  Input,
  List,
  ListItem,
  TagCloseTrigger,
  TagLabel,
  TagRoot,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState, useTransition } from "react";

// --- COMPONENTE AUXILIAR: Input de Tags / Seleção ---
interface CreatableTagInputProps {
  label: string;
  placeholder: string;
  existingOptions: { uuid: string; name: string }[];
  selected: SelectOption[];
  onChange: (items: SelectOption[]) => void;
  singleMode?: boolean; // Usado para Localização (apenas 1 permitido)
}

function CreatableTagInput({
  label,
  placeholder,
  existingOptions,
  selected,
  onChange,
  singleMode,
}: CreatableTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  // Filtra as opções existentes baseadas no que está sendo digitado
  const suggestions = existingOptions
    .filter(
      (opt) =>
        opt.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selected.some((s) => s.name.toLowerCase() === opt.name.toLowerCase()),
    )
    .slice(0, 5); // Mostra no máximo 5 sugestões

  const handleAdd = (optionName: string, uuid?: string) => {
    if (!optionName.trim() || (singleMode && selected.length >= 1)) return;

    const isNew = !uuid;
    const newItem: SelectOption = { name: optionName.trim(), isNew, uuid };
    onChange([...selected, newItem]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Verifica se o texto digitado bate exatamente com alguma sugestão existente
      const exactMatch = suggestions.find(
        (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase(),
      );
      if (exactMatch) {
        handleAdd(exactMatch.name, exactMatch.uuid);
      } else {
        handleAdd(inputValue); // Cria como novo
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(selected.filter((_, index) => index !== indexToRemove));
  };

  return (
    <VStack alignItems="stretch">
      <Text fontWeight="bold">{label}</Text>
      <Wrap mb={2}>
        {selected.map((item, index) => (
          <WrapItem key={index}>
            <TagRoot
              size="md"
              colorScheme={item.isNew ? "green" : "blue"}
              borderRadius="full"
            >
              <TagLabel>{item.name}</TagLabel>
              <TagCloseTrigger asChild>
                {" "}
                <CloseButton onClick={() => removeTag(index)} />{" "}
              </TagCloseTrigger>
            </TagRoot>
          </WrapItem>
        ))}
      </Wrap>

      {(!singleMode || selected.length === 0) && (
        <Box position="relative">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {/* Dropdown de Sugestões */}
          {inputValue && suggestions.length > 0 && (
            <List.Root
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              bg="white"
              boxShadow="md"
              borderRadius="md"
              mt={1}
              maxH="200px"
              overflowY="auto"
            >
              {suggestions.map((opt) => (
                <ListItem
                  key={opt.uuid}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => handleAdd(opt.name, opt.uuid)}
                >
                  {opt.name}
                </ListItem>
              ))}
            </List.Root>
          )}
          {inputValue && suggestions.length === 0 && (
            <Text fontSize="sm" color="green.500" mt={1}>
              Pressione Enter para cadastrar "{inputValue}" como novo.
            </Text>
          )}
        </Box>
      )}
    </VStack>
  );
}

// --- COMPONENTE PRINCIPAL DO FORMULÁRIO ---
interface FormProps {
  dbAuthors: { uuid: string; name: string }[];
  dbGenres: { uuid: string; name: string }[];
  dbPublishers: { uuid: string; name: string }[];
  dbLocations: { uuid: string; name: string }[];
}

export default function CreateItemForm({
  dbAuthors,
  dbGenres,
  dbPublishers,
  dbLocations,
}: FormProps) {
  const [isPending, startTransition] = useTransition();

  // Estados dos campos nativos
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");

  // Estados dos campos relacionais
  const [authors, setAuthors] = useState<SelectOption[]>([]);
  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [publishers, setPublishers] = useState<SelectOption[]>([]);
  const [location, setLocation] = useState<SelectOption[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !year) {
      toaster.create({ title: "Preencha o título e o ano.", type: "error" });
      return;
    }

    startTransition(async () => {
      const payload = {
        description,
        year: parseInt(year),
        location: location.length > 0 ? location[0] : null,
        authors,
        genres,
        publishers,
      };

      const result = await createLibraryItem(payload);

      if (result.success) {
        toaster.create({
          title: "Livro cadastrado com sucesso!",
          type: "success",
        });
        // Limpar formulário
        setDescription("");
        setYear("");
        setAuthors([]);
        setGenres([]);
        setPublishers([]);
        setLocation([]);
      } else {
        toaster.create({ title: result.error, type: "error" });
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

        <CreatableTagInput
          label="Autores (Vários)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbAuthors}
          selected={authors}
          onChange={setAuthors}
        />

        <CreatableTagInput
          label="Gêneros (Vários)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbGenres}
          selected={genres}
          onChange={setGenres}
        />

        <CreatableTagInput
          label="Editoras (Várias)"
          placeholder="Digite e pressione Enter..."
          existingOptions={dbPublishers}
          selected={publishers}
          onChange={setPublishers}
        />

        <CreatableTagInput
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
