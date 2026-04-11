<template>
  <div class="w-full   bg-white border-t-2 border-custom-border p-2">
    <div class="flex justify-around ">
      <router-link v-for="item in navItems" :key="item.name" :to="item.path"
        class="flex flex-col items-center gap-2 py-2 justify-center rounded-full ">
        <img :src="isActive(item.path) ? item.darkIcon : item.lightIcon" alt="">
        <p class="text-[11px]" :class="isActive(item.path) ? 'text-custom-primary' : 'text-[#acacac]'">{{ item.label
          }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path: string) => {
  return route.path === path
}

const navItems = [
  {
    name: 'market',
    path: '/market',
    label: 'Market',
    darkIcon: '/bottombar/market-dark.svg',
    lightIcon: '/bottombar/market-light.svg',
  },
  {
    name: 'watchlist',
    path: '/watchlist',
    label: 'Watchlist',
    darkIcon: '/bottombar/watchlist-dark.svg',
    lightIcon: '/bottombar/watchlist-light.svg',
  },

  {
    name: 'orders',
    path: '/orders',
    label: 'Orders',
    darkIcon: '/bottombar/order-dark.svg',
    lightIcon: '/bottombar/order-light.svg',
  },
  {
    name: 'positions',
    path: '/positions',
    label: 'Positions',
    darkIcon: '/bottombar/position-dark.svg',
    lightIcon: '/bottombar/position-light.svg',
  },
  // {
  //   name: 'wallet',
  //   path: '/wallet',
  //   label: 'Wallet',
  //   darkIcon: '/bottombar/wallet-dark.svg',
  //   lightIcon: '/bottombar/wallet-light.svg',
  // },
  {
    name: 'profile',
    path: '/profile',
    label: 'Profile',
    darkIcon: '/bottombar/user-dark.svg',
    lightIcon: '/bottombar/user-light.svg',
  },


]
</script>
