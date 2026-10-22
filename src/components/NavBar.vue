
<template>
  <v-navigation-drawer
    v-model="drawer"
    color="teal-darken-1"
    theme="dark"
    app
    v-if="isAuthenticated || !hideForUnauthenticated"
  >
    <!-- User Profile -->
    <div class="d-flex flex-column align-center pa-4">
      <v-avatar size="100">
        <v-img :src="userAvatar" alt="User avatar" cover />
      </v-avatar>

      <div class="text-subtitle-1 mt-2 text-center">
        {{ userName }}
      </div>

      <div class="text-caption">
        {{ userRole }}
      </div>
    </div>

    <v-divider />

    <!-- Navigation Links -->
    <v-list nav density="comfortable">
      <v-list-item
        v-for="path in filteredPaths"
        :key="path.route"
        :to="path.route"
        :prepend-icon="path.icon"
        :title="path.text"
        active-class="border"
        rounded="lg"
      />
    </v-list>
  </v-navigation-drawer>

  <!-- Top App Bar -->
  <v-app-bar color="teal-darken-4">
    <v-app-bar-nav-icon
      v-if="isAuthenticated || !hideForUnauthenticated"
      @click.stop="drawer = !drawer"
    />

    <v-toolbar-title class="text-uppercase">
      <span class="font-weight-light">Online-Shop</span>
    </v-toolbar-title>

    <v-spacer />

    <!-- Top Menu -->
    <v-menu>
      <template #activator="{ props: menuProps }">
        <v-btn v-bind="menuProps" variant="text">
          <v-icon start>mdi-chevron-down</v-icon>
          Menu
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="path in filteredPaths"
          :key="path.route"
          :to="path.route"
          :prepend-icon="path.icon"
          :title="path.text"
        />
      </v-list>
    </v-menu>

    <!-- Logout -->
    <v-btn
      v-if="isAuthenticated"
      variant="text"
      class="ml-2"
      @click="handleLogout"
    >
      <v-icon start>mdi-logout</v-icon>
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TokenService from '../services/tokenService'

const props = defineProps({
  hideForUnauthenticated: {
    type: Boolean,
    default: true,
  },
})

const drawer = ref(true)
const router = useRouter()

// Read authentication data from localStorage
const currentUser = ref(TokenService.getUser() || {})
const abilities = ref(TokenService.getAbilities() || {})

const isAuthenticated = computed(() => TokenService.isAuthenticated())

const isAdmin = computed(() => {
  return (
    currentUser.value?.role?.slug === 'admin' ||
    abilities.value?.admin === true
  )
})

const userName = computed(() => {
  return currentUser.value?.name || 'Guest'
})

const userRole = computed(() => {
  return currentUser.value?.role?.name || 'User'
})

const userAvatar = computed(() => {
  const photo =
    currentUser.value?.user_photo ||
    currentUser.value?.user_image

  if (!photo) {
    return 'https://picsum.photos/192/192?random'
  }

  // Support absolute URLs and Laravel storage paths
  if (/^https?:\/\//i.test(photo)) {
    return photo
  }

  return `/storage/${photo.replace(/^\/+/, '')}`
})

// All navigation routes
const allPaths = [
  // Public routes
  {
    icon: 'mdi-home',
    text: 'Home',
    route: '/',
    public: true,
  },
  {
    icon: 'mdi-information',
    text: 'About Us',
    route: '/about-us',
    public: true,
  },
  {
    icon: 'mdi-flask',
    text: 'Test Page',
    route: '/test',
    public: true,
  },

  // Authentication routes
  {
    icon: 'mdi-login',
    text: 'Login',
    route: '/login',
    guestOnly: true,
  },
  {
    icon: 'mdi-account-plus',
    text: 'Sign Up',
    route: '/sign-up',
    guestOnly: true,
  },

  // Authenticated routes
  {
    icon: 'mdi-view-dashboard',
    text: 'Welcome',
    route: '/welcome',
    requiresAuth: true,
  },
  {
    icon: 'mdi-account-group',
    text: 'Users',
    route: '/users',
    requiresAuth: true,
    requiredAbility: ['admin', 'editor', 'user'],
  },
  {
    icon: 'mdi-shape',
    text: 'Categories',
    route: '/categories',
    requiresAuth: true,
    requiredAbility: ['admin', 'editor', 'user'],
  },  
  {
    icon: 'mdi-shield-account',
    text: 'Roles',
    route: '/roles',
    requiresAuth: true,
    // requiredAbility: ['admin', 'editor', 'user'],
  },
  {
    icon: 'mdi-receipt-text',
    text: 'Orders',
    route: '/orders',
    requiresAuth: true,
    requiredAbility: ['admin', 'editor', 'user'],
  },
]

// Filter navigation routes
const filteredPaths = computed(() => {
  const loggedIn = isAuthenticated.value

  return allPaths.filter((path) => {
    // Public routes are always visible
    if (path.public) {
      return true
    }

    // Guest-only routes appear when logged out
    if (path.guestOnly) {
      return !loggedIn
    }

    // Protected routes appear only when logged in
    if (path.requiresAuth) {
      if (!loggedIn) {
        return false
      }

      // Apply permission checks when required
      if (path.requiredAbility) {
        const required = path.requiredAbility

        const hasPermission = required.some((ability) => {
          return abilities.value?.[ability] === true
        })

        return hasPermission || isAdmin.value
      }

      return true
    }

    return false
  })
})

// Logout
function handleLogout() {
  TokenService.removeToken()

  currentUser.value = {}
  abilities.value = {}
  window.location.href = '/login'
  // router.push({ name: 'LoginPage' })
}
</script>

<style scoped>
.border {
  border-left: 4px solid #0ba518;
}
</style>
