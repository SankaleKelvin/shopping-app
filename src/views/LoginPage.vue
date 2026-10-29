<template>
  <v-container fluid class="pa-4">
    <v-row align="center" justify="center" style="min-height: 60vh">
      <v-col cols="10" sm="8" md="6" lg="4">
        <v-card elevation="6" rounded="xl" class="pa-6">
          <div class="text-center mb-4">
            <div class="text-h5 font-weight-medium">Welcome back</div>
            <div class="text-subtitle-1 text-secondary">Sign in to access your account</div>
          </div>

          <v-form @submit.prevent="login">
            <v-text-field
              v-model="email"
              label="Email"
              required
              prepend-inner-icon="mdi-email"
              type="email"
            />

            <v-text-field
              v-model="password"
              type=password
              label="Password"
              required
              prepend-inner-icon="mdi-lock"
            />

            <v-row class="mt-4" justify="center" align="center">
              <v-btn type="button" outlined @click="clear" :disabled="loading">Clear</v-btn>
              &nbsp; &nbsp;
              <v-btn class="ms-4" color="primary" type="submit"> Sign in </v-btn>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <div class="text-center">
            <h2 class="text-secondary">Don't have an account? <RouterLink to="/sign-up">register</RouterLink> </h2>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import TokenService from '../services/tokenService'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(null)
const snackbar = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

function showError(message) {
  error.value = message
  snackbar.value = true
}

async function login() {
  if (!email.value || !password.value) {
    showError('Email and password are required')
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await api.post('login-user', { email: email.value, password: password.value })
    const { token, user: userData, abilities: userAbilities } = response.data

    if (token && userData) {
      TokenService.setToken(token)
      TokenService.setUser(userData)
      TokenService.setAbilities(userAbilities)
      window.location.href = '/welcome'
    } else {
      showError('Invalid response format from server')
    }
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message)
    showError(err.response?.data?.message || err.message || 'Login failed')
  } finally {
    loading.value = false
  }
}

function clear() {
  email.value = ''
  password.value = ''
  error.value = null
  snackbar.value = false
}
</script>
