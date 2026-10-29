import { defineStore } from 'pinia'
import api from '../services/api'
import api_2 from '../services/api_2'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    // dialogs & UI state
    dialog: false,
    dialogDelete: false,
    // editedIndex will hold the user id when editing, -1 when creating
    editedIndex: -1,
    editedItem: {
      id: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_active: true,
      role_id: null,
      user_image: null, // stored path
    },
    defaultItem: {
      id: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_active: true,
      role_id: null,
      user_image: null,
    },
    // snackbars
    snackbarCreate: false,
    snackbarUpdate: false,
    snackbarDelete: false,
    // delete target id
    deletingId: null,
  }),

  actions: {
    async fetchUsers() {
      try {
        const resp = await api.get('/read-users')
        // Expect array
        this.users = resp.data.users
      } catch (err) {
        console.error('fetchUsers error', err)
      }
    },

    async createUser(formData) {
      try {
        const resp = await api_2.post('/create-user', formData)
        await this.fetchUsers()
        this.snackbarCreate = true
      } catch (err) {
        console.error('createUser error', err)
        throw err
      }
    },

    async updateUser(id, formData) {
      try {
        const resp = await api_2.post(`/update-user/${id}`, formData)

        await this.fetchUsers()
        this.snackbarUpdate = true
      } catch (err) {
        console.error('updateUser error', err)
        throw err
      }
    },

    async deleteUser(id) {
      try {
        await api_2.delete(`/deleteUser/${id}`)
        const idx = this.users.findIndex((u) => u.id == id)
        if (idx !== -1) this.users.splice(idx, 1)
        this.snackbarDelete = true
      } catch (err) {
        console.error('deleteUser error', err)
        throw err
      } finally {
        this.dialogDelete = false
        this.deletingId = null
      }
    },

    async editItem(id) {
      try {
        // Get single user from API
        const resp = await api.get(`/read-user/${id}`)
        const data = resp.data.user
        // normalise to editedItem shape
        this.editedIndex = id
        this.editedItem = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          password: '', // leave blank for update
          password_confirmation: '', // leave blank for update
          is_active: data.is_active ?? true,
          role_id: data.role_id ?? null,
          user_image: data.user_image ?? null,
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
