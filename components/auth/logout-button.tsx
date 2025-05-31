"use client";
import React, { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    setLoading(true);
    const { error } = await authClient.signOut();
    if (error) {
      console.error("Logout error:", error);
    }
    // Redirect to login page
    window.location.href = "/login";
  }
  
  return (
    <button 
      onClick={() => handleLogOut()} 
      className="w-full text-left text-gray-700 dark:text-gray-300 font-normal disabled:opacity-70"
      disabled={loading}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
