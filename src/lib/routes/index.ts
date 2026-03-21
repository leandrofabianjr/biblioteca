import { Route } from "next";

export const ROUTES = {
  // Rotas Públicas
  home: '/',
  login: '/login',

  // Rotas Privadas
  loggedUser: {
    root: () => '/u' as Route,
    dashboard: () => '/u' as Route,
  },
} as const;
