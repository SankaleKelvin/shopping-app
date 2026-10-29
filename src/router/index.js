import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import TestPage from '../views/TestPage.vue'
import LoginPage from '../views/LoginPage.vue'
import SignUp from '../views/SignUp.vue'
import WelcomePage from '../views/WelcomePage.vue'
import TokenService from '../services/tokenService.js'
import UsersPage from '../views/UsersPage.vue'
import RolesPage from '../views/RolesPage.vue'
import CategoriesPage from '../views/CategoriesPage.vue'
import ProductsPage from '@/views/ProductsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about-us',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/test',
      name: 'TestPage',
      component: TestPage,
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
    },
    {
      path: '/sign-up',
      name: 'SignUp',
      component: SignUp,
    },
    {
      path: '/welcome',
      name: 'Welcome',
      component: WelcomePage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/users',
      name: 'UsersPage',
      component: UsersPage,
      meta: {
        requiresAuth: true,
        requiredAbility: ['admin'],
      },
    },
    {
      path: '/categories',
      name: 'CategoriesPage',
      component: CategoriesPage,
      meta: {
        requiresAuth: true,
        requiredAbility: ['admin', 'customer'],
      },
    },
    {
      path: '/roles',
      name: 'RolesPage',
      component: RolesPage,
      meta: {
        requiresAuth: true,
        requiredAbility: ['admin'],
      },
    },  
    {
      path: '/products',
      name: 'ProductsPage',
      component: ProductsPage,
      meta: {
        requiresAuth: true,
        requiredAbility: ['admin', 'customer'],
      },
    },  
  ],
})
// Navigation guard
router.beforeEach((to) => {
  const loggedIn = TokenService.isAuthenticated()

  // Require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!loggedIn) {
      return {
        name: 'LoginPage',
        query: { redirect: to.fullPath },
      }
    }

    // Check required abilities
    const required = to.meta.requiredAbility

    if (required) {
      const userAbilities = TokenService.getAbilities()

      const hasRequiredAbility = required.some(
        ability => userAbilities[ability] === true
      )

      if (!hasRequiredAbility) {
        return { name: 'Welcome' }
      }
    }
  }

  // Redirect authenticated users away from guest-only pages
  if (to.matched.some(record => record.meta.guestOnly) && loggedIn) {
    return { name: 'home' }
  }

  return true
})

export default router