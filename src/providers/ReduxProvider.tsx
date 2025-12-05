"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";

interface ReduxProviderProps {
  children: ReactNode;
}

const store = makeStore();

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
