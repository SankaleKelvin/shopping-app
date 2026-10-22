import { defineStore } from 'pinia'
import { ref, shallowRef, toRef } from 'vue'
import api from '../services/api'

export const useRoleStore = defineStore('role', () => {
  function createNewRecord() {
    return {
      name: '',
      description: '',
    }
  }

  const roles = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.id)

  function add() {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit(id) {
    const found = roles.value.find((role) => role.id === id)

    formModel.value = {
      id: found.id,
      name: found.name,
      slug: found.description,
    }

    dialog.value = true
  }

  async function remove(id) {
    //Delete Function
    try {
      await api.delete(`/delete-role/${id}`)
      location.reload()
    } catch (error) {
      console.error('Failed to Delete Role.', error?.response?.message)
    }
  }

  async function save() {
    if (isEditing.value) {
      //Update Function
      try {
        await api.post(`/update-role/${formModel.value.id}`, formModel.value)
        location.reload()
      } catch (error) {
        console.error('Failed to Save Role.', error?.response?.message)
      }
    } else {
      //Save Function
      try {
        await api.post('/create-role', formModel.value)
        location.reload()
      } catch (error) {
        console.error('Failed to Save Role.', error?.response?.message)
      }
    }

    dialog.value = false
  }

  function reset() {
    dialog.value = false
    formModel.value = createNewRecord()
    roles.value = []
  }

  async function getRoles() {
    try {
      const response = await api.get('/read-roles')
      roles.value = response.data.roles 
    } catch (error) {
      console.error('Failed to fetch Roles', error?.response?.message)
    }
  }

  return {
    roles,
    formModel,
    isEditing,
    dialog,
    add,
    edit,
    remove,
    save,
    reset,
    getRoles,
  }
})
