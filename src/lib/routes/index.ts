import { Route } from "next";

export const ROUTES = {
  // Rotas Públicas
  home: '/',
  login: '/login',

  // Rotas Privadas
  loggedUser: {
    root: () => '/u' as Route,
    dashboard: () => '/u' as Route,
    items: {
      root: () => '/u/itens' as Route,
      create: () => '/u/itens/cadastrar' as Route
    }
  },
} as const;
