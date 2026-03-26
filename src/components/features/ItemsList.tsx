'use client';

import {
  Box,
  ButtonGroup,
  EmptyState,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  SimpleGrid,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { LuSearch, LuSearchX } from 'react-icons/lu';
import { ItemCard } from './ItemCard';

export type LibraryItem = {
  id: string;
  description: string;
  year: number;
  isbn: string | null;
  coverImage: string | null;
  location: { description: string } | null;
  item_authors: { author: { name: string } }[];
  item_genres: { genre: { id: string; description: string } }[];
  item_publishers: { publisher: { name: string } }[];
};

interface LibraryProps {
  initialItems: LibraryItem[];
  itemsCount: number;
  pageSize: number;
  currentPage: number;
}

export default function ItemsList({
  initialItems,
  itemsCount,
  pageSize,
  currentPage,
}: LibraryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateRouteParams = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchTermChange = (newTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Limpa o parâmetro de página ao fazer nova pesquisa

    if (newTerm) {
      params.set('q', newTerm);
    } else {
      params.delete('q');
    }

    updateRouteParams(params);
  };

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    updateRouteParams(params);
  };

  return (
    <>
      <Box mb={8} maxW="md" mx="auto">
        <SearchBar
          isLoading={isPending}
          initialInputValue={searchParams.get('q')}
          onTermChange={handleSearchTermChange}
        />
      </Box>

      <Box opacity={isPending ? 0.6 : 1} transition="opacity 0.2s">
        {initialItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3, '2xl': 4 }} gap={6}>
            {initialItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <LuSearchX size={48} />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>Nada encontrado</EmptyState.Title>
                <EmptyState.Description>
                  Tente pesquisar por termos diferentes
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
      </Box>

      <Paginator
        count={itemsCount}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </>
  );
}

function SearchBar(props: {
  isLoading: boolean;
  initialInputValue: string | null;
  onTermChange: (term: string) => void;
}) {
  const initialValue = props.initialInputValue || '';
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValue == initialValue) return;
      console.log(inputValue, initialValue);
      props.onTermChange(inputValue);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, props, initialValue]);

  return (
    <InputGroup
      flex="1"
      startElement={<LuSearch />}
      endElement={props.isLoading ? <Spinner /> : null}
    >
      <Input
        placeholder="Filtrar por título, autor, gênero, editora ou localização"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        boxShadow="sm"
        pl={10}
        borderRadius="md"
      />
    </InputGroup>
  );
}

function Paginator(props: {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}) {
  if (props.count <= props.pageSize) return null;
  return (
    <HStack justifyContent="center" mt={8}>
      <Pagination.Root
        count={props.count}
        page={props.page}
        pageSize={props.pageSize}
        onPageChange={({ page }) => props.onPageChange(page)}
      >
        <ButtonGroup variant="ghost" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <HiChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton>
              <HiChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </HStack>
  );
}
