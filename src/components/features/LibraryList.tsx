"use client";

import {
  Badge,
  Box,
  ButtonGroup,
  CardBody,
  CardHeader,
  CardRoot,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { LuSearch } from "react-icons/lu";

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
  // Estado local para o input para evitar delays de digitação
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");

  // Atualiza o URL (debounce simples de 500ms para não fazer query a cada letra)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Pega o termo de busca atual da URL
      const currentQuery = searchParams.get("q") || "";

      // A MÁGICA ESTÁ AQUI: Só continua se o input for diferente da URL atual.
      // Isso quebra o loop infinito!
      if (inputValue === currentQuery) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1"); // Volta para a página 1 ao fazer nova pesquisa

      if (inputValue) {
        params.set("q", inputValue);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, pathname, router, searchParams]);

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Box maxW="7xl" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading as="h1" mb={6} textAlign="center">
        Biblioteca
      </Heading>

      {/* Input de Pesquisa */}
      <Box mb={8} maxW="md" mx="auto">
        <Flex position="relative" align="center">
          <Input
            placeholder="Filtrar por título, autor, género..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            bg="white"
            boxShadow="sm"
            pl={10}
            borderRadius="md"
          />
          <Icon as={LuSearch} position="absolute" left={3} color="gray.400" />
        </Flex>
      </Box>

      {/* Listagem Responsiva */}
      {/* Listagem */}
      <Box opacity={isPending ? 0.6 : 1} transition="opacity 0.2s">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={6}>
          {initialItems.length > 0 ? (
            initialItems.map((item) => (
              <CardRoot
                key={item.id}
                variant="outline"
                boxShadow="md"
                _hover={{ boxShadow: "lg" }}
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
                          .join(", ") || "N/A"}
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
                          .join(", ") || "N/A"}
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
                        {item.location?.description || "Não informada"}
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
            ))
          ) : (
            <Box
              columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
              textAlign="center"
              py={10}
            >
              <Text color="gray.500">Nenhum item encontrado.</Text>
            </Box>
          )}
        </SimpleGrid>
      </Box>

      {/* Controlos de Paginação */}

      <Paginator
        count={itemsCount}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </Box>
  );
}
function Paginator(props: {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}) {
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
              <IconButton variant={{ base: "ghost", _selected: "outline" }}>
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
