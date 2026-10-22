import { defineStore } from 'pinia'
import { ref, shallowRef, toRef } from 'vue'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  function createNewRecord() {
    return {
      name: '',
      email: '',
      role_id: '',
      user_image: '',
      password: '',
      password_confirmation: '',
    }
  }

  const users = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const dialogDelete = shallowRef(false)
  const editedIndex = -1
  const itemToDelete = ''
  const isEditing = toRef(() => !!formModel.value.id)

  function add() {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit(id) {
    const found = users.value.find((user) => user.id === id)

    formModel.value = {
      id: found.id,
      name: found.name,
      email: found.email,
      role_id: found.role_id,
      user_image: '',
      password: '',
      password_confirmation: '',
    }

    dialog.value = true
  }

  async function save() {
    if (isEditing.value) {
      //Update Function
      // try {
      //   await api.post(`/updateUser/${formModel.value.id}`, formModel.value)
      //   location.reload()
      // } catch (error) {
      //   console.error('Failed to Save User.', error?.response?.message)
      // }
      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/updateUser/${formModel.value.id}`,
          formModel.value,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )
      } catch (error) {
        console.error('Failed to Save User.', error?.response?.message)
      }
    } else {
      //Save Function
      try {
        await api.post('/register', formModel.value)
        location.reload()
      } catch (error) {
        console.error('Failed to Save User.', error?.response?.message)
      }
    }

    dialog.value = false
  }

  function reset() {
    dialog.value = false
    formModel.value = createNewRecord()
    users.value = []
  }

  async function getUsers() {
    try {
      const response = await api.get('/getUser')
      users.value = response.data.User
    } catch (error) {
      console.error('Failed to fetch Users', error?.response?.message)
    }
  }

  function deleteUser(id) {
    editedIndex.value = id
    itemToDelete.value = id
    dialogDelete.value = true
  }

  async function remove(id) {
    //Delete Function
    try {
      await api.delete(`/deleteUser/${id}`)
      location.reload()
    } catch (error) {
      console.error('Failed to Delete User.', error?.response?.message)
    }
  }

  function closeDelete() {
    dialogDelete.value = false
  }

  return {
    users,
    formModel,
    isEditing,
    dialog,
    dialogDelete,
    add,
    edit,
    remove,
    save,
    reset,
    getUsers,
  }
})
