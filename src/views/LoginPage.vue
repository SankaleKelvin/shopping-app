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
              :type="showPassword ? 'text' : 'password'"
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

import api from '../services/api'
import TokenService from '../services/tokenService'
import router from '../router/index'

const loading = ref(false)
const error = ref(null)
const email = ref('')
const password = ref('')
const user = ref(null)
const abilities = ref({})

async function login() {
    loading.value = true
    error.value = null
    
    try {
      // Ensure email and password are not empty
      if (!email.value || !password.value) {
        throw new Error('Email and password are required')
      }
      
      const response = await api.post('login-user', {email: email.value, password: password.value})
      
      // Check if we have user and token in the response
      if (response.data.token && response.data.user) {
        const { token, user: userData, abilities: userAbilities } = response.data
                
        // Set user data and abilities
        user.value = userData
        abilities.value = userAbilities || {}
        
        // Save token
        TokenService.setToken(token)
        TokenService.setUser(userData)
        // TokenService.setAbilities(userAbilities)
          window.location.href = '/welcome'
        // router.push('/welcome')
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message)
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

function clear() {
  initialState.value
}
</script>
