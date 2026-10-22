<template>
  <v-app>
    <NavBar />
    <v-main class="main-content">
      <Router-View />
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
</script>

<style>
.main-content{
  padding-top: 20px; 
  min-height: 90vh; 
  flex-grow: 1;
}
</style>