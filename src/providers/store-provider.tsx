"use client"
import { Provider } from "react-redux"
import { makeStore } from "@/store/store"
import React from "react"

const store = makeStore()

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}

