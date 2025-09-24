"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchCustomersApi, createCustomerApi, updateCustomerApi, deleteCustomerApi, type Customer } from "./customersApi"

export const fetchCustomers = createAsyncThunk("customers/fetch", async () => {
  const data = await fetchCustomersApi()
  return data
})

export const createCustomer = createAsyncThunk("customers/create", async (payload: Omit<Customer, "id" | "createdAt">) => {
  const data = await createCustomerApi(payload)
  return data
})

export const updateCustomer = createAsyncThunk("customers/update", async (payload: Customer) => {
  const data = await updateCustomerApi(payload)
  return data
})

export const removeCustomer = createAsyncThunk("customers/remove", async (id: number) => {
  await deleteCustomerApi(id)
  return id
})

type CustomersState = {
  items: Customer[]
  loading: boolean
  error?: string
}

const initialState: CustomersState = { items: [], loading: false }

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    toggleStatus(state, action: PayloadAction<number>) {
      const customer = state.items.find((c) => c.id === action.payload)
      if (customer) {
        customer.status = customer.status === "Active" ? "Inactive" : "Active"
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load customers"
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
      })
  },
})

export const { toggleStatus } = customersSlice.actions
export default customersSlice.reducer

export const selectCustomers = (s: RootState) => s.customers.items
export const selectCustomersLoading = (s: RootState) => s.customers.loading
export const selectCustomersError = (s: RootState) => s.customers.error
