import { defineStore } from 'pinia'
import api from '../services/api'
import api_2 from '../services/api_2'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    // dialogs & UI state
    dialog: false,
    dialogDelete: false,
    // editedIndex will hold the product id when editing, -1 when creating
    editedIndex: -1,
    editedItem: {
      id: '',
      name: '',
      price: '',
      category_id: null,
      product_image: null,
    },
    defaultItem: {
      name: '',
      price: '',
      category_id: null,
      product_image: null,
    },

    // delete target id
    deletingId: null,
  }),

  actions: {
    async fetchProducts() {
      try {
        const resp = await api.get('/read-products')
        // Expect array
        this.products = resp.data.products
      } catch (err) {
        console.error('fetchProducts error', err)
      }
    },

    async createProduct(formData) {
      try {
        const resp = await api_2.post('/create-product', formData)
        await this.fetchProducts()
        this.snackbarCreate = true
      } catch (err) {
        console.error('createProduct error', err)
        throw err
      }
    },

    async updateProduct(id, formData) {
      try {
        const resp = await api_2.post(`/update-product/${id}`, formData)
        await this.fetchProducts()
        this.snackbarUpdate = true
      } catch (err) {
        console.error('updateProduct error', err)
        throw err
      }
    },

    async deleteProduct(id) {
      try {
        await api_2.delete(`/delete-product/${id}`)
        const idx = this.products.findIndex((u) => u.id == id)
        if (idx !== -1) this.products.splice(idx, 1)
        this.snackbarDelete = true
      } catch (err) {
        console.error('deleteProduct error', err)
        throw err
      } finally {
        this.dialogDelete = false
        this.deletingId = null
      }
    },

    async editItem(id) {
      try {
        // Get single product from API
        const resp = await api.get(`/read-product/${id}`)
        const data = resp.data.product
        // normalise to editedItem shape
        this.editedIndex = id
        this.editedItem = {
          id: data.id,
          name: data.name || '',
          price: data.price || '',
          category_id: data.category_id ?? null,
          product_image: data.product_image ?? null,
        }
        this.dialog = true
      } catch (err) {
        console.error('editItem error', err)
      }
    },

    openDialog() {
      this.editedIndex = -1
      this.editedItem = { ...this.defaultItem }
      this.dialog = true
    },

    closeDialog() {
      this.dialog = false
      this.editedItem = { ...this.defaultItem }
      this.editedIndex = -1
    },

    openDelete(id) {
      this.deletingId = id
      this.dialogDelete = true
    },

    closeDelete() {
      this.dialogDelete = false
      this.deletingId = null
    },
  },
})
