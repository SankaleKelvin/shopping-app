<template>
  <v-container fluid class="pa-4">
    <v-row align="center" justify="center" style="min-height: 60vh">
      <v-col cols="10" sm="8" md="6" lg="4">
        <v-card elevation="6" rounded="xl" class="pa-6">
          <div class="text-center mb-4">
            <div class="text-h5 font-weight-medium">Register</div>
            <div class="text-subtitle-1 text-secondary">Sign Up to get started</div>
          </div>

          <v-form @submit.prevent="signup">
            <v-text-field
              v-model="state.name"
              label="Name"
              required
              prepend-inner-icon="mdi-account"
            />

            <v-text-field
              v-model="state.email"
              label="Email"
              required
              prepend-inner-icon="mdi-email"
              type="email"
            />

            <v-text-field
              v-model="state.password"
              label="Password"
              required
              type="password'"
              prepend-inner-icon="mdi-lock"
            />

            <v-text-field
              v-model="state.password_confirmation"
              label="Confirm Password"
              required
              type="password'"
              prepend-inner-icon="mdi-lock"
            />

            <v-row class="mt-4" justify="center" align="center">
              <v-btn type="button" outlined @click="clear" :disabled="loading">Clear</v-btn>
              &nbsp; &nbsp;
              <v-btn class="ms-4" color="primary" type="submit"> Sign Up </v-btn>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <div class="text-center">
            <small class="text-secondary"> Already a member? <RouterLink to="/login">login</RouterLink></small>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref } from 'vue'

import api from '../services/api'
import { RouterLink } from 'vue-router'

const initialState = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

const state = ref({
  ...initialState,
})

async function signup() {
  try {
    const response = await api.post('/register-user', state.value)
    alert('Registration Successful!:', response.data)
  } catch (error) {
    console.error('Login Failed', error.response?.data || error.message)
  }
  clear()
}

function clear() {
  state.value = { ...initialState }
}
</script>
