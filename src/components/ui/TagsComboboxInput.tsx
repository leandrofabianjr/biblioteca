'use client';

import {
  Combobox,
  TagsInput,
  useCombobox,
  useFilter,
  useListCollection,
  useTagsInput,
  VStack,
} from '@chakra-ui/react';
import { useId, useRef } from 'react';

// Tipagem baseada no seu código
export type SelectOption =
  | { isNew: true; name: string; id?: string }
  | { isNew: false; name: string; id: string };

interface TagsComboboxInputProps {
  label: string;
  placeholder: string;
  existingOptions: { id: string; name: string }[];
  selected: SelectOption[];
  onChange: (items: SelectOption[]) => void;
  singleMode?: boolean; // Usado para Localização (apenas 1 permitido)
}

export function TagsComboboxInput({
  label,
  placeholder,
  existingOptions,
  selected,
  onChange,
  singleMode,
}: TagsComboboxInputProps) {
  // 1. Configura o filtro para a busca no Combobox
  const { contains } = useFilter({ sensitivity: 'base' });

  // 2. Prepara a coleção de opções existentes para o Combobox
  const { collection, filter } = useListCollection({
    initialItems: existingOptions,
    itemToString: (item) => item.name,
    itemToValue: (item) => item.name, // O valor será o nome para sincronizar com o TagsInput
    filter: contains,
  });

  const uid = useId();
  const controlRef = useRef<HTMLDivElement | null>(null);

  // 3. Configura o TagsInput
  const tags = useTagsInput({
    ids: { input: `input_${uid}`, control: `control_${uid}` },
    // O valor visual do TagsInput é apenas um array com os nomes das tags selecionadas
    value: selected.map((s) => s.name),
    onValueChange: (e) => {
      const newSelectedNames = e.value;

      // Reconstroi o array de SelectOption baseado nas strings
      const newSelected = newSelectedNames.map((name) => {
        // Já estava selecionado antes?
        const existingSelected = selected.find((s) => s.name === name);
        if (existingSelected) return existingSelected;

        // É uma opção que já existe no banco/coleção?
        const existingOption = existingOptions.find((o) => o.name === name);
        if (existingOption) {
          return { isNew: false, id: existingOption.id, name };
        }

        // Se não é nenhum dos dois, é uma tag nova criada pelo usuário
        return { isNew: true, name };
      }) as SelectOption[];

      // Aplica a regra do singleMode (substitui o valor antigo pelo novo se passar de 1)
      if (singleMode && newSelected.length > 1) {
        onChange([newSelected[newSelected.length - 1]]);
      } else {
        onChange(newSelected);
      }
    },
  });

  // 4. Configura o Combobox
  const combobox = useCombobox({
    ids: { input: `input_${uid}`, control: `control_${uid}` },
    collection,
    onInputValueChange(e) {
      filter(e.inputValue);
    },
    value: [], // Deixamos vazio pois o Combobox age apenas como um "seletor", quem guarda o estado é o TagsInput
    allowCustomValue: true, // Permite digitar algo que não está na lista
    onValueChange: (e) => {
      if (e.value.length > 0) {
        const val = e.value[0];
        // Evita adicionar duplicados se o usuário clicar na mesma sugestão duas vezes
        if (!tags.value.includes(val)) {
          tags.addValue(val);
        }
      }
    },
    selectionBehavior: 'clear', // Limpa o input após a seleção
  });

  const isInputHidden = singleMode && selected.length >= 1;

  return (
    <VStack alignItems="stretch">
      <Combobox.RootProvider value={combobox}>
        <TagsInput.RootProvider value={tags}>
          <TagsInput.Label fontWeight="bold">{label}</TagsInput.Label>

          <TagsInput.Control ref={controlRef}>
            {tags.value.map((tagName, index) => {
              // Recupera o estado (novo/existente) para estilizarmos a cor, como no seu original
              const isNew = selected.find((s) => s.name === tagName)?.isNew;

              return (
                <TagsInput.Item
                  key={index}
                  index={index}
                  value={tagName}
                  // Simula o colorScheme="green" ou "blue" do código antigo
                  bg={isNew ? 'green.100' : 'blue.100'}
                  color={isNew ? 'green.800' : 'blue.800'}
                  borderRadius="full"
                >
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText>{tagName}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                </TagsInput.Item>
              );
            })}

            {/* Esconde o input se estiver no modo single e já tiver uma tag selecionada */}
            {!isInputHidden && (
              <Combobox.Input unstyled asChild>
                <TagsInput.Input placeholder={placeholder} />
              </Combobox.Input>
            )}
          </TagsInput.Control>

          {/* Renderiza as sugestões do dropdown */}
          <Combobox.Positioner>
            <Combobox.Content maxH="200px" overflowY="auto">
              {collection.items.map(
                (item) =>
                  // Oculta a sugestão se a tag já estiver selecionada
                  !tags.value.includes(item.name) && (
                    <Combobox.Item item={item} key={item.id} cursor="pointer">
                      <Combobox.ItemText>{item.name}</Combobox.ItemText>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ),
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </TagsInput.RootProvider>
      </Combobox.RootProvider>
    </VStack>
  );
}
