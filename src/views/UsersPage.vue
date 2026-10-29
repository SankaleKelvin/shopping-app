<template>
  <v-container>
   
    <!-- Data table -->
    <v-data-table :headers="headers" :items="usersStore.users" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat color="blue">
          <v-toolbar-title>Users</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn color="white" style="background-color: grey;" @click="openCreate">New User</v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.user_image`]="{ item }">
        <v-img
          :src="getImageUrl(item.user_image)"
          alt="User"
          width="48"
          height="48"
          v-if="item.user_image"
        ></v-img>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="me-2" @click="onEdit(item.id)">mdi-pencil</v-icon>
        <v-icon small @click="onDelete(item.id)">mdi-delete</v-icon>
      </template>

      <template v-slot:no-data>
        <v-btn color="primary" @click="refresh">Reload</v-btn>
      </template>
    </v-data-table>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="usersStore.dialog" max-width="600px" @click:outside="closeDialog">
      <v-card>
        <v-card-title style="background-color: cornflowerblue;">
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="usersStore.editedItem.name" label="Name"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="usersStore.editedItem.email" label="Email"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="usersStore.editedItem.password"
                  label="Password"
                  type="password"
                  :hint="passwordHint"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="usersStore.editedItem.password_confirmation"
                  label="Confirm Password"
                  type="password"
                  :hint="passwordHint"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="rolesStore.roles"
                  v-model="usersStore.editedItem.role_id"
                  label="Role"
                  item-value="id"
                  item-title="name"
                  :return-object="false"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch v-model="usersStore.editedItem.is_active" label="Active"></v-switch>
              </v-col>

              <v-col cols="12" md="6">
                <v-file-input
                  v-model="selectedFile"
                  label="Upload Image"
                  accept="image/*"
                  show-size
                  clearable
                  @update:model-value="onFileChange"
                ></v-file-input>

                <!-- preview: new file if selected, otherwise existing image -->
                <v-img v-if="filePreview" :src="filePreview" width="200" height="200" cover></v-img>

                <v-img
                  v-else-if="
                    typeof usersStore.editedItem.user_image === 'string' &&
                    usersStore.editedItem.user_image
                  "
                  :src="getImageUrl(usersStore.editedItem.user_image)"
                  width="200"
                  height="200"
                  cover
                ></v-img>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn style="background-color: coral;" text @click="closeDialog">Cancel</v-btn>
          <v-btn style="background-color: cornflowerblue;" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="dialogDelete" max-width="400px" @click:outside="closeDelete">
      <v-card>
        <v-card-title class="text-h6">Confirm delete?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDelete">Cancel</v-btn>
          <v-btn text color="error" @click="confirmDelete">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUsersStore } from '@/stores/user'
import { useRolesStore } from '@/stores/role'

const usersStore = useUsersStore()
const rolesStore = useRolesStore()

// Image upload and preview
const selectedFile = ref(null)
const filePreview = ref(null)

// Snackbar timeout
const snackbarTimeout = 1500

// Snackbar state
const snackbarCreate = computed({
  get: () => usersStore.snackbarCreate,
  set: (value) => (usersStore.snackbarCreate = value),
})

const snackbarUpdate = computed({
  get: () => usersStore.snackbarUpdate,
  set: (value) => (usersStore.snackbarUpdate = value),
})

const snackbarDelete = computed({
  get: () => usersStore.snackbarDelete,
  set: (value) => (usersStore.snackbarDelete = value),
})

// Dialog state
const dialog = computed({
  get: () => usersStore.dialog,
  set: (value) => (usersStore.dialog = value),
})

const dialogDelete = computed({
  get: () => usersStore.dialogDelete,
  set: (value) => (usersStore.dialogDelete = value),
})

// User data
const editedItem = computed(() => usersStore.editedItem)

const formTitle = computed(() =>
  usersStore.editedIndex === -1 ? 'New User' : 'Edit User',
)

const passwordHint = computed(() =>
  usersStore.editedIndex === -1
    ? 'Required'
    : 'Leave blank to keep current',
)

// Table headers
const headers = [
  { title: '', key: 'user_image', sortable: false, align: 'start' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role.name', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

// API base URL
const BASE = (
  import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

// Image URL
function getImageUrl(path) {
  if (!path || path instanceof File || typeof path !== 'string') {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${BASE}/storage/${path.replace(/^\/+/, '')}`
}

// Handle image selection
function onFileChange(files) {
  clearImagePreview()

  const file = Array.isArray(files) ? files[0] : files

  if (!(file instanceof File)) return

  selectedFile.value = file
  filePreview.value = URL.createObjectURL(file)
}

// Clear image preview and release browser resources
function clearImagePreview() {
  if (filePreview.value) {
    URL.revokeObjectURL(filePreview.value)
    filePreview.value = null
  }

  selectedFile.value = null
}

// Fetch initial data
onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    rolesStore.getRoles(),
  ])
})

// Release temporary image URL when component is destroyed
onBeforeUnmount(() => {
  clearImagePreview()
})

// Open create dialog
function openCreate() {
  clearImagePreview()
  usersStore.openDialog()
}

// Open edit dialog
async function onEdit(id) {
  clearImagePreview()
  await usersStore.editItem(id)
}

// Open delete dialog
function onDelete(id) {
  usersStore.openDelete(id)
}

// Close create/edit dialog
function closeDialog() {
  clearImagePreview()
  usersStore.closeDialog()
}

// Close delete dialog
function closeDelete() {
  usersStore.closeDelete()
}

// Save user
async function save() {
  const item = editedItem.value
  const isEditing = usersStore.editedIndex !== -1

  const formData = new FormData()

  formData.append('name', item.name || '')
  formData.append('email', item.email || '')
  formData.append('is_active', item.is_active ? '1' : '0')

  if (item.password) {
    formData.append('password', item.password)
  }

  if (item.password_confirmation) {
    formData.append('password_confirmation', item.password_confirmation)
  }

  if (item.role_id !== null && item.role_id !== undefined && item.role_id !== '') {
    formData.append('role_id', item.role_id)
  }

  // Append image only when a new file has been selected
  if (selectedFile.value instanceof File) {
    formData.append('user_image', selectedFile.value)
  }

  // Password is required when creating a user
  if (!isEditing && !item.password) {
    console.error('Password is required when creating a user.')
    return
  }

  try {
    if (isEditing) {
      await usersStore.updateUser(usersStore.editedIndex, formData)
      snackbarUpdate.value = true
    } else {
      await usersStore.createUser(formData)
      snackbarCreate.value = true
    }

    // Refresh the user list
    await usersStore.fetchUsers()

    // Reset form and preview
    clearImagePreview()
    usersStore.closeDialog()
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

// Delete user
async function confirmDelete() {
  if (!usersStore.deletingId) return

  try {
    await usersStore.deleteUser(usersStore.deletingId)
    snackbarDelete.value = true
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Reload users
async function refresh() {
  await usersStore.fetchUsers()
}
</script>