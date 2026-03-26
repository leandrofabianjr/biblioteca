'use client';

import { deleteItemForLoggedUser } from '@/actions/items';
import { IconButton } from '@chakra-ui/react';
import { useTransition } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { toaster } from '../ui/toaster';
import { Tooltip } from '../ui/tooltip';

interface ItemDeleteButtonProps {
  itemId: string;
}

export function ItemDeleteButton({ itemId }: ItemDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    // Confirmação nativa simples para evitar cliques acidentais
    if (
      !window.confirm('Tem certeza que deseja mover este item para a lixeira?')
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteItemForLoggedUser(itemId);

      if (result.success) {
        console.log('Item movido para a lixeira.');
        toaster.create({
          title: 'Item movido para a lixeira.',
          type: 'success',
        });
      } else {
        toaster.create({
          title: 'Ocorreu um erro ao excluir.',
          description: JSON.stringify(result.error),
          type: 'error',
        });
      }
    });
  };

  return (
    <Tooltip content="Excluir">
      <IconButton
        colorPalette="red"
        size="sm"
        onClick={handleDelete}
        loading={isPending}
        loadingText="Excluindo..."
        aria-label="Excluir"
      >
        <LuTrash2 />
      </IconButton>
    </Tooltip>
  );
}
