<template>
  <v-container class="py-10" fluid>
    <v-row justify="center">
      <v-col cols="10" md="5" lg="4">
        <v-card class="welcome-card" elevation="8">
          <!-- Header -->
          <div class="card-header">
            <v-avatar size="90" class="avatar">
              <v-img :src="userPhotoUrl" alt="User photo" cover />
            </v-avatar>
          </div>

          <!-- Body -->
          <v-card-text class="text-center mt-4">
            <h2>Welcome</h2>
            <h3 v-if="user.name">{{ user.name }}</h3>
            <div v-else class="text-subtle">Guest</div>
            <div class="mt-1 text-caption">{{ user.email }}</div>

            <v-divider class="my-4"></v-divider>

            <div><strong>Role:</strong> {{ user.role?.name || '—' }}</div>
          </v-card-text>

          <!-- Footer -->
          <v-card-actions class="justify-center pb-4">
            <v-btn color="primary" rounded="xl" @click="logout">Logout</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TokenService from '../services/tokenService'

const router = useRouter()

// Retrieve the user saved during login
const user = ref(TokenService.getUser() || {})

const userPhotoUrl = computed(() => {
  return user.value?.user_image
    ? `/storage/${user.value.user_image}`
    : 'https://picsum.photos/300/300?random'
})

function logout() {
  TokenService.removeToken()
  window.location.href='/login'
}
</script>


<style scoped>
.welcome-card {
  border-radius: 16px;
  overflow: hidden;
  transition: 0.3s;
}
.welcome-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}
.card-header {
  background: linear-gradient(135deg, #4edfcc, #6f1cc8);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}
.avatar {
  border: 3px solid #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.text-subtle {
  color: rgba(0, 0, 0, 0.6);
}
</style>
