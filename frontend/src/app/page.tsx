"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LoginForm } from "@/components/LoginForm";
import { authApi } from "@/lib/api";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(username, password);
      if (response.user_id) {
        setUserId(response.user_id);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    }
    setIsAuthenticated(false);
    setUserId(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <KanbanBoard userId={userId!} onLogout={handleLogout} />;
}
