<template>
  <v-container>
    <v-sheet border rounded>
      <v-data-table
        :headers="headers"        
        :items="categoryStore.categories"
      >
        <template v-slot:top>
          <v-toolbar color="teal" flat>
            <v-toolbar-title>
              <v-icon
                color="medium-emphasis"
                icon="mdi-category-multiple"
                size="x-small"
                start
              ></v-icon>

              Popular categories
            </v-toolbar-title>

            <v-btn
              class="me-2"
              prepend-icon="mdi-plus"
              rounded="lg"
              text="Add a Category"
              border
              @click="categoryStore.add"
            ></v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.title="{ value }">
          <v-chip :text="value" border="thin opacity-25" prepend-icon="mdi-category" label>
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
              @click="categoryStore.edit(item.id)"
            ></v-icon>

            <v-icon 
              color="medium-emphasis"
              icon="mdi-delete"
              size="small"
              @click="categoryStore.remove(item.id)"
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
            @click="categoryStore.reset"
          ></v-btn>
        </template>
      </v-data-table>
    </v-sheet>

    <v-dialog v-model="categoryStore.dialog" max-width="500">
      <v-card
        :subtitle="`${isEditing ? 'Update' : 'Create'} your favorite category`"
        :title="`${isEditing ? 'Edit' : 'Add'} a Category`"
      >
        <template v-slot:text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="categoryStore.formModel.name" label="Name"></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="categoryStore.formModel.description" label="Description"></v-text-field>
            </v-col>

          </v-row>
        </template>

        <v-divider></v-divider>

        <v-card-actions class="bg-surface-light">
          <v-btn text="Cancel" variant="plain" @click="categoryStore.dialog = false"></v-btn>

          <v-spacer></v-spacer>

          <v-btn text="Save" @click="categoryStore.save"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { onMounted } from 'vue'
import { useCategoriesStore } from '../stores/category'

const categoryStore = useCategoriesStore()

const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Name', key: 'name' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

onMounted(() => {
  categoryStore.fetchCategories()
})


</script>
