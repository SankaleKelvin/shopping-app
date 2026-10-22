<template>
  <v-container>
    <v-sheet border rounded>
      <v-data-table
        :headers="headers"
        :hide-default-footer="userStore.users.length < 11"
        :items="userStore.users"
      >
        <template v-slot:top>
          <v-toolbar color="teal" flat>
            <v-toolbar-title>
              <v-icon
                color="medium-emphasis"
                icon="mdi-user-multiple"
                size="x-small"
                start
              ></v-icon>

              Popular users
            </v-toolbar-title>

            <v-btn
              class="me-2"
              prepend-icon="mdi-plus"
              rounded="lg"
              text="Add a User"
              border
              @click="userStore.add"
            ></v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.title="{ value }">
          <v-chip :text="value" border="thin opacity-25" prepend-icon="mdi-user" label>
            <template v-slot:prepend>
              <v-icon color="medium-emphasis"></v-icon>
            </template>
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-icon
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              @click="userStore.edit(item.id)"
            ></v-icon>

            <v-icon
              color="medium-emphasis"
              icon="mdi-delete"
              size="small"
              @click="userStore.remove(item.id)"
            ></v-icon>
          </div>
        </template>

        <template v-slot:no-data>
          <v-btn
            prepend-icon="mdi-backup-restore"
            rounded="lg"
            text="Reset data"
            variant="text"
            border
            @click="userStore.reset"
          ></v-btn>
        </template>
      </v-data-table>
    </v-sheet>

    <v-dialog v-model="userStore.dialog" max-width="500">
      <v-card
        :subtitle="`${isEditing ? 'Update' : 'Create'} your favorite user`"
        :title="`${isEditing ? 'Edit' : 'Add'} a User`"
      >
        <template v-slot:text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="userStore.formModel.name" label="Name"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="userStore.formModel.email" label="Email"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="userStore.formModel.role_id"
                :items="roleStore.roles"
                item-title="name"
                item-value="id"
                label="Role"
              ></v-select>
            </v-col>


            <v-col cols="12" md="6">
              <v-file-input 
                v-model="user_image"
                placeholder="Upload your Profile image"
                accept="image/png, image/jpg, image/jpeg"
                prepend-icon="mdi-camera"
                label="Profile Picture"                
              >
              </v-file-input>
            </v-col>


            <v-col cols="12" md="6">
              <v-text-field v-model="userStore.formModel.password" label="Password"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="userStore.formModel.password_confirmation"
                label="Confirm Password"
              ></v-text-field>
            </v-col>
          </v-row>
        </template>

        <v-divider></v-divider>

        <v-card-actions class="bg-surface-light">
          <v-btn text="Cancel" variant="plain" @click="userStore.dialog = false"></v-btn>

          <v-spacer></v-spacer>

          <v-btn text="Save" @click="userStore.save"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userStore.dialogDelete" max-width="500px" @click:outside="closeDelete">
      <v-card>
        <v-card-title class="text-h5">Are you sure you want to delete this truck?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm()">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRoleStore } from '../stores/role'

const userStore = useUserStore()
const roleStore = useRoleStore()

const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role_name' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

onMounted(() => {
  userStore.getUsers()
  roleStore.getRoles()
})

function add() {
  formModel.value = createNewRecord()
  dialog.value = true
}
function createNewRecord() {
  return {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  }
}

function edit(id) {
  userStore.edit(id)
}
</script>
