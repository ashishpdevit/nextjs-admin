"use client"
import { configureStore } from "@reduxjs/toolkit"
import adminReducer from "@/store/admin"
import customersReducer from "@/store/customers"
import productsReducer from "@/store/products"
import ordersReducer from "@/store/orders"
import appSettingsReducer from "@/store/appSettings"
import appMenuLinksReducer from "@/store/appMenuLinks"
import contactReducer from "@/store/contact"
import faqsReducer from "@/store/faqs"
import rbacReducer from "@/store/rbac"

export const makeStore = () =>
  configureStore({
    reducer: {
      admins: adminReducer,
      customers: customersReducer,
      products: productsReducer,
      orders: ordersReducer,
      appSettings: appSettingsReducer,
      appMenuLinks: appMenuLinksReducer,
      contact: contactReducer,
      faqs: faqsReducer,
      rbac: rbacReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
