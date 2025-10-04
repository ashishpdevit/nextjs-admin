"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store/store"
import { fetchOrdersApi, createOrderApi, updateOrderApi, deleteOrderApi, type Order } from "./ordersApi"

export const fetchOrders = createAsyncThunk("orders/fetch", async () => {
  const data = await fetchOrdersApi()
  return data
})

export const createOrder = createAsyncThunk("orders/create", async (payload: Omit<Order, "id">) => {
  const data = await createOrderApi(payload)
  return data
})

export const updateOrder = createAsyncThunk("orders/update", async (payload: Order) => {
  const data = await updateOrderApi(payload)
  return data
})

export const removeOrder = createAsyncThunk("orders/remove", async (id: string) => {
  await deleteOrderApi(id)
  return id
})

type OrdersState = {
  items: Order[]
  loading: boolean
  error?: string
}

const initialState: OrdersState = { items: [], loading: false }

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    toggleStatus(state, action: PayloadAction<string>) {
      const order = state.items.find((o) => o.id === action.payload)
      if (order) {
        const statusMap: { [key: string]: string } = {
          "Pending": "Paid",
          "Paid": "Shipped",
          "Shipped": "Refunded",
          "Refunded": "Pending"
        }
        order.status = statusMap[order.status] || "Pending"
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to load orders"
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload)
      })
  },
})

export const { toggleStatus } = ordersSlice.actions
export default ordersSlice.reducer

export const selectOrders = (s: RootState) => s.orders.items
export const selectOrdersLoading = (s: RootState) => s.orders.loading
export const selectOrdersError = (s: RootState) => s.orders.error
