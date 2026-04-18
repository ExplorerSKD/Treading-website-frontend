<template>
  <div class="bottom-nav">
    <router-link v-for="item in navItems" :key="item.name" :to="item.path"
      class="nav-item" :class="{ 'active': isActive(item.path) }">
      <i :class="item.icon"></i>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path: string) => {
  return route.path === path
}

const navItems = [
  { name: 'market', path: '/market', label: 'Market', icon: 'fas fa-chart-line' },
  { name: 'watchlist', path: '/watchlist', label: 'Watchlist', icon: 'fas fa-search-dollar' },
  { name: 'positions', path: '/positions', label: 'Positions', icon: 'fas fa-exchange-alt' },
  { name: 'orders', path: '/orders', label: 'Orders', icon: 'fas fa-briefcase' },
  { name: 'profile', path: '/profile', label: 'Profile', icon: 'fas fa-user-circle' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.bottom-nav {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--container-bg, #FFFFFF);
  border-top: none; /* Removed ugly cut line */
  display: flex; justify-content: space-around; align-items: center;
  height: 64px; width: 100%; position: relative;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.015);
}
:global(body.dark) .bottom-nav { background: #071824; border-color: #374151; }

.nav-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--text-sub, #64748B); cursor: pointer; width: 62px; height: 100%; text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}
.nav-item i { font-size: 1.25rem; transition: all 0.2s ease; margin-bottom: 3px;}
.nav-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2px; transition: color 0.2s ease; }
.nav-item:hover { color: var(--brand-dark-green, #1F4529); }

/* Flat Contained Active Button */
.nav-item.active {
  background: var(--brand-dark-green, #1F4529);
  color: white; 
  width: 70px; height: 48px;
  border-radius: 24px;
  transform: translateY(0);
  justify-content: center;
  padding-top: 0;
  box-shadow: 0 4px 10px rgba(31, 69, 41, 0.1); 
  border: none;
}
.nav-item.active i { font-size: 1.3rem; color: white; margin-bottom: 2px; }
.nav-item.active .nav-label { color: white; margin-bottom: 0px; }

:global(body.dark) .nav-item { color: #9CA3AF; }
:global(body.dark) .nav-item:hover { color: #10B981; }

:global(body.dark) .nav-item.active { 
  background: #10B981; color: #0F172A; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2); 
}
:global(body.dark) .nav-item.active .nav-label { color: #0F172A; }
</style>
