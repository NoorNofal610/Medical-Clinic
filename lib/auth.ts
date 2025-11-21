"use client";

import { User } from "./api";

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

export const setStoredUser = (user: User | null): void => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

export const logout = (): void => {
  setStoredUser(null);
  window.location.href = "/";
};

