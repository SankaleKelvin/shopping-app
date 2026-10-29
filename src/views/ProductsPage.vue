<template>
  <v-container>
    <!-- Customer Product Grid -->
    <div v-if="can('customer')">
      <v-row>
        <v-col
          v-for="product in productsStore.products"
          :key="product.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="h-100" elevation="3">
            <v-img :src="getImageUrl(product.product_image)" height="220" cover />

            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold">
                {{ product.name }}
              </div>

              <div class="text-body-2 text-grey">
                {{ product.category?.name || 'Uncategorized' }}
              </div>

              <div class="text-h6 text-primary mt-2">
                {{ formatPrice(product.price) }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn block color="primary" @click="viewProduct(product)"> View Product </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <!-- Product Management View -->
    <div v-else>
      <!-- Data table -->
      <v-data-table :headers="headers" :items="productsStore.products" class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat color="primary">
            <v-toolbar-title>Products</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn color="white" style="background-color: grey" @click="openCreate"
              >New Product</v-btn
            >
          </v-toolbar>
        </template>

        <template v-slot:[`item.product_image`]="{ item }">
          <v-img
            :src="getImageUrl(item.product_image)"
            alt="Product"
            width="48"
            height="48"
            v-if="item.product_image"
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
      <v-dialog v-model="productsStore.dialog" max-width="600px" @click:outside="closeDialog">
        <v-card>
          <v-card-title style="background-color: cornflowerblue">
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="productsStore.editedItem.name" label="Name"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productsStore.editedItem.price"
                    label="Product Price"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    :items="categoriesStore.categories"
                    v-model="productsStore.editedItem.category_id"
                    label="Categories"
                    item-value="id"
                    item-title="name"
                    :return-object="false"
                  ></v-select>
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
                  <v-img
                    v-if="filePreview"
                    :src="filePreview"
                    width="200"
                    height="200"
                    cover
                  ></v-img>

                  <v-img
                    v-else-if="
                      typeof productsStore.editedItem.product_image === 'string' &&
                      productsStore.editedItem.product_image
                    "
                    :src="getImageUrl(productsStore.editedItem.product_image)"
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
            <v-btn style="background-color: coral" text @click="closeDialog">Cancel</v-btn>
            <v-btn style="background-color: cornflowerblue" text @click="save">Save</v-btn>
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
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProductsStore } from '@/stores/product'
import { useCategoriesStore } from '@/stores/category'
import { useAuth } from '@/services/authService'

const { can } = useAuth()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// Image upload and preview
const selectedFile = ref(null)
const filePreview = ref(null)

// Dialog state
const dialog = computed({
  get: () => productsStore.dialog,
  set: (value) => (productsStore.dialog = value),
})

const dialogDelete = computed({
  get: () => productsStore.dialogDelete,
  set: (value) => (productsStore.dialogDelete = value),
})

// Product data
const editedItem = computed(() => productsStore.editedItem)

const formTitle = computed(() =>
  productsStore.editedIndex === -1 ? 'New Product' : 'Edit Product',
)

// Table headers
const headers = [
  { title: 'Image', key: 'product_image', sortable: false, align: 'start' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Category', key: 'category.name', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

// API base URL
const BASE = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

// Resolve stored image paths
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
  await Promise.all([productsStore.fetchProducts(), categoriesStore.fetchCategories()])
})

// Clean up on component destruction
onBeforeUnmount(() => {
  clearImagePreview()
})

// Open create dialog
function openCreate() {
  clearImagePreview()
  productsStore.openDialog()
}

// Open edit dialog
async function onEdit(id) {
  clearImagePreview()
  await productsStore.editItem(id)
}

// Open delete dialog
function onDelete(id) {
  productsStore.openDelete(id)
}

// Close create/edit dialog
function closeDialog() {
  clearImagePreview()
  productsStore.closeDialog()
}

// Close delete dialog
function closeDelete() {
  productsStore.closeDelete()
}

// Save product
async function save() {
  const item = editedItem.value
  const isEditing = productsStore.editedIndex !== -1

  const formData = new FormData()

  formData.append('name', item.name || '')
  formData.append('price', item.price ?? '')

  if (item.category_id !== null && item.category_id !== undefined && item.category_id !== '') {
    formData.append('category_id', item.category_id)
  }

  // Upload only a newly selected image
  if (selectedFile.value instanceof File) {
    formData.append('product_image', selectedFile.value)
  }

  try {
    if (isEditing) {
      await productsStore.updateProduct(productsStore.editedIndex, formData)
    } else {
      await productsStore.createProduct(formData)
    }

    // Refresh products after saving
    await productsStore.fetchProducts()

    // Reset form and image preview
    clearImagePreview()
    productsStore.closeDialog()
  } catch (error) {
    console.error('Error saving product:', error)
  }
}

// Delete product
async function confirmDelete() {
  if (!productsStore.deletingId) return

  try {
    await productsStore.deleteProduct(productsStore.deletingId)
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

// Reload products
async function refresh() {
  await productsStore.fetchProducts()
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(Number(price) || 0)
}
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}
</style>
