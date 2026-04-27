import { createBrowserRouter } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import ChallengePage from "@/pages/ChallengePage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import TeamPage from "@/pages/TeamPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "challenges/:challengeId",
        element: <ChallengePage />,
      },
      {
        path: "teams/:challengeTeamId",
        element: <TeamPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

