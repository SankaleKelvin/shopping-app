<template>
  <v-main style="padding-top: 20px; min-height: calc(100vh - 64px)">
    <v-row justify="center">
      <v-col cols="10">
        <v-form>
          <v-card class="p-4" color="cyan">
            <v-card-title>
              <h2>Enter Your Names</h2>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="firstName" label="First name" required></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="lastName" label="Last name" required></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="userName" label="User name" required></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row justify="center">
                <v-col cols="6" class="text-center bg-info">
                  <h1>{{ userName }}</h1>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-main>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('')
const lastName = ref('')

//Computed being implemented to join both first and last name.
const userName = computed(() => `${firstName.value}_${lastName.value}`)
</script>