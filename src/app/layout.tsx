import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biblioteca',
  description: 'Sistema de gerenciamento da minha biblioteca de livros.',
  openGraph: {
    title: 'Biblioteca',
    description: 'Sistema de gerenciamento da minha biblioteca de livros.',
    url: 'https://biblioteca-ten-topaz.vercel.app',
    siteName: 'Meu Acervo',
    images: [
      {
        url: 'https://biblioteca-ten-topaz.vercel.app/icon.png',
        width: 512,
        height: 512,
        alt: 'Biblioteca',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="pt-BR">
      <body>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
