import { ROUTES } from '@/lib/routes';
import {
    Badge,
    Box,
    Card,
    Flex,
    Heading,
    HStack,
    IconButton,
    Image,
    Stack,
    Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { LuBuilding, LuMapPin, LuPencil, LuUser } from 'react-icons/lu'; // Ícones para os dados
import { Tooltip } from '../ui/tooltip';
import { ItemDeleteButton } from './ItemDeleteButton';
import { LibraryItem } from './ItemsList';
// Importe o CardRoot, CardBody, etc. do seu diretório de componentes do Chakra v3

export function ItemCard({ item }: { item: LibraryItem }) {
  // Helpers para formatar as strings e evitar código muito longo no JSX
  const authors =
    item.item_authors.map((ia) => ia.author.name).join(', ') || 'Sem autor';
  const publishers =
    item.item_publishers.map((ip) => ip.publisher.name).join(', ') ||
    'Sem editora';
  const location = item.location?.description || 'Não informada';

  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.description)}&background=random&size=512&font-size=0.3&color=fff&rounded=false`;

  return (
    <Card.Root flexDirection="row" overflow="hidden">
      <Box maxW="200px">
        <Image
          // Se você ainda não tem um campo 'imageUrl' no banco, use esse placeholder
          // ou adicione a propriedade no objeto item no futuro.
          src={item.coverImage || placeholderUrl}
          alt={`Capa de ${item.description}`}
          objectFit="cover"
          w="100%"
          h="100%"
        />
      </Box>
      <Box flex="1">
        <Card.Body flex="1" display="flex" flexDirection="column">
          {/* 2. Título */}
          <Box>
            <Heading
              size="md"
              lineHeight="1.3"
              lineClamp={2}
              title={item.description}
            >
              {item.description}
            </Heading>
          </Box>

          <Box>
            <Heading
              size="sm"
              lineHeight="1.3"
              title={`(${item.year})`}
              color="fg.muted"
              lineClamp={2}
            >
              ({item.year})
            </Heading>
          </Box>

          {/* 3. Metadados com Ícones (Substitui os textos antigos e feios) */}
          <Stack mt="auto">
            <HStack color="fg.muted" title={authors}>
              <Box as={LuUser} flexShrink={0} />
              <Text fontSize="sm" lineClamp={1}>
                {authors}
              </Text>
            </HStack>

            <HStack color="fg.muted" title={publishers}>
              <Box as={LuBuilding} flexShrink={0} />
              <Text fontSize="sm" lineClamp={1}>
                {publishers}
              </Text>
            </HStack>

            <HStack color="fg.muted" title={location}>
              <Box as={LuMapPin} flexShrink={0} />
              <Text fontSize="sm" lineClamp={1}>
                {location}
              </Text>
            </HStack>
          </Stack>

          {/* 4. Gêneros (Badges) */}
          {item.item_genres.length > 0 && (
            <Flex wrap="wrap" gap={2} mt={1}>
              {item.item_genres.map((ig) => (
                <Badge key={ig.genre.id}>{ig.genre.description}</Badge>
              ))}
            </Flex>
          )}
        </Card.Body>

        {/* 5. Rodapé com Ações */}
        <Card.Footer>
          <Flex gap={2} w="100%" justify="flex-end">
            <Tooltip content="Editar">
              <IconButton
                size="sm"
                variant="outline"
                colorScheme="blue"
                aria-label="Editar"
                asChild
              >
                <Link href={ROUTES.loggedUser.items.edit({ id: item.id })}>
                  <LuPencil />
                </Link>
              </IconButton>
            </Tooltip>
            {/* Suponho que o seu ItemDeleteButton seja um IconButton também */}
            <ItemDeleteButton itemId={item.id} />
          </Flex>
        </Card.Footer>
      </Box>
    </Card.Root>
  );
}
