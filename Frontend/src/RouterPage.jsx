import React, { useState, useEffect } from "react";
import App from "./App.jsx";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";

import AuthPage from "./AuthPage.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/app",
    element: <App />,
    loader: requireAuth, // Protect /app route
  },
  {
    path: "/",
    loader: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) return redirect("/app");
      return redirect("/login");
    },
  },
]);

async function requireAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect("/login");
  }

  return session;
}

export default function RouterPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const currentSession = await supabase.auth.getSession();
      setSession(currentSession.data.session);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
}
