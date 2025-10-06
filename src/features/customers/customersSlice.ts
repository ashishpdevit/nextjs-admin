"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchCustomersApi, createCustomerApi, updateCustomerApi, deleteCustomerApi, type Customer, type CustomersParams, type CustomersResponse } from "./customersApi"

export const fetchCustomers = createAsyncThunk("customers/fetch", async (params?: CustomersParams) => {
  const response = await fetchCustomersApi(params)
  return response
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
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

const initialState: CustomersState = { 
  items: [], 
  loading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  },
  links: {
    first: null,
    last: null,
    prev: null,
    next: null
  }
}

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
        state.items = action.payload?.data || []
        state.pagination = {
          current_page: action.payload?.meta?.current_page || 1,
          last_page: action.payload?.meta?.last_page || 1,
          per_page: action.payload?.meta?.per_page || 10,
          total: action.payload?.meta?.total || 0,
          from: action.payload?.meta?.from || 0,
          to: action.payload?.meta?.to || 0
        }
        state.links = action.payload?.links || {
          first: null,
          last: null,
          prev: null,
          next: null
        }
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
export const selectCustomersPagination = (s: RootState) => s.customers.pagination
export const selectCustomersLinks = (s: RootState) => s.customers.links
