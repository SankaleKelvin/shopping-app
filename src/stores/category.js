import { defineStore } from 'pinia'
import { ref, shallowRef, toRef } from 'vue'
import api from '../services/api'

export const useCategoryStore = defineStore('category', () => {
  function createNewRecord() {
    return {
      name: '',
      description: '',
    }
  }

  const categories = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.id)

  function add() {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit(id) {
    const found = categories.value.find((category) => category.id === id)

    formModel.value = {
      id: found.id,
      name: found.name,
      description: '',
    }

    dialog.value = true
  }

  async function remove(id) {
    //Delete Function
    try {
      await api.delete(`/delete-category/${id}`)
      location.reload()
    } catch (error) {
      console.error('Failed to Delete Category.', error?.response?.message)
    }
  }

  async function save() {
    if (isEditing.value) {
      //Update Function
      try {
        await api.post(`/update-category/${formModel.value.id}`, formModel.value)
        location.reload()
      } catch (error) {
        console.error('Failed to Save Category.', error?.response?.message)
      }
    } else {
      //Save Function
      try {
        await api.post('/create-category', formModel.value)
        location.reload()
      } catch (error) {
        console.error('Failed to Save Category.', error?.response?.message)
      }
    }

    dialog.value = false
  }

  function reset() {
    dialog.value = false
    formModel.value = createNewRecord()
    categories.value = []
  }

  async function getCategories() {
    try {
      const response = await api.get('/read-categories')
      categories.value = response.data.Category
    } catch (error) {
      console.error('Failed to fetch Categories', error?.response?.message)
    }
  }

  return {
    categories,
    formModel,
    isEditing,
    dialog,
    add,
    edit,
    remove,
    save,
    reset,
    getCategories

  }
})
