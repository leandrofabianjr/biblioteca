'use client';

import {
  Badge,
  Box,
  ButtonGroup,
  CardBody,
  CardHeader,
  CardRoot,
  EmptyState,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { LuSearch, LuSearchX } from 'react-icons/lu';

export type LibraryItem = {
  id: string;
  description: string;
  year: number;
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

export default function LibraryList({
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
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={6}>
            {initialItems.map((item) => (
              <CardRoot
                key={item.id}
                variant="outline"
                boxShadow="md"
                _hover={{ boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardHeader pb={2}>
                  <Heading size="md" mb={2} title={item.description}>
                    {item.description}
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {item.year}
                  </Text>
                </CardHeader>

                <CardBody pt={2}>
                  <Stack gap={3}>
                    {/* Autores */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.500"
                      >
                        Autor(es)
                      </Text>
                      <Text fontSize="sm">
                        {item.item_authors
                          .map((ia) => ia.author.name)
                          .join(', ') || 'N/A'}
                      </Text>
                    </Box>

                    {/* Editoras */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.500"
                      >
                        Editora(s)
                      </Text>
                      <Text fontSize="sm">
                        {item.item_publishers
                          .map((ip) => ip.publisher.name)
                          .join(', ') || 'N/A'}
                      </Text>
                    </Box>

                    {/* Localização */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.500"
                      >
                        Localização
                      </Text>
                      <Text fontSize="sm">
                        {item.location?.description || 'Não informada'}
                      </Text>
                    </Box>

                    {/* Gêneros (Badges) */}
                    <Flex wrap="wrap" gap={2} mt={2}>
                      {item.item_genres.map((ig) => (
                        <Badge
                          key={ig.genre.id}
                          colorScheme="blue"
                          variant="subtle"
                        >
                          {ig.genre.description}
                        </Badge>
                      ))}
                    </Flex>
                  </Stack>
                </CardBody>
              </CardRoot>
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
        placeholder="Filtrar por título, autor, género..."
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
