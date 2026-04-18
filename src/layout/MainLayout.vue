<template>
    <div class="flex min-h-screen layout-bg">
        <!-- Desktop Sidebar -->
        <aside class="hidden md:flex flex-col w-72 bg-white border-r border-custom-border fixed h-full z-50">
            <div class="p-8">
                <img src="/logo.png" class="w-36" alt="Logo">
            </div>

            <nav class="flex-1 px-4 space-y-2 mt-4">
                <router-link v-for="item in navItems" :key="item.name" :to="item.path"
                    class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group"
                    :class="isActive(item.path)
                        ? 'bg-custom-primary text-white shadow-[0_10px_20px_rgba(1,10,24,0.15)]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-custom-primary'">
                    <div class="w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
                        <img :src="isActive(item.path) ? item.darkIcon : item.lightIcon" alt=""
                            :class="{ 'brightness-0 invert': isActive(item.path) }">
                    </div>
                    <span class="font-semibold text-[15px]">{{ item.label }}</span>
                </router-link>
            </nav>

            <div class="p-6 border-t border-custom-border">
                <div class="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-custom-primary/10 flex items-center justify-center">
                        <img src="/bottombar/user-dark.svg" class="w-5 h-5 opacity-50 trader-profile-icon" alt="">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-custom-primary truncate">Trader Account</p>
                        <p class="text-xs text-gray-500 truncate">Verified User</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 md:ml-72 flex flex-col min-w-0">
            <main class="w-full pb-24 md:pb-8 mx-auto flex-1 content-bg">
                <div class="max-w-[1600px] mx-auto">
                    <RouterView />
                </div>
            </main>

            <!-- Mobile Bottom Bar -->
            <div v-if="!['chart', 'wallet', 'trade-reports', 'ledger'].includes(route.name)"
                class="md:hidden fixed flex justify-center bottom-0 left-0 w-full z-40">
                <div class="w-full fixed bottom-0">
                    <BottomNavigation />
                </div>
            </div>
        </div>
    </div>
    <NotificationModal />
</template>

<script setup>
import BottomNavigation from '@/components/BottomNavigation.vue'
import NotificationModal from '@/components/NotificationModal.vue';
import { useProfileStore } from '@/stores/profile';
import useWatchlistStore from '@/stores/watchlist';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';


const watchlistStore = useWatchlistStore()
const profileStore = useProfileStore()

const route = useRoute()

onMounted(() => {
    const savedTheme = localStorage.getItem('marginApexTheme') || localStorage.getItem('app-theme')
    if (savedTheme === 'dark') {
        document.body.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
    }
})

const isActive = (path) => {
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
    {
        name: 'profile',
        path: '/profile',
        label: 'Profile',
        darkIcon: '/bottombar/user-dark.svg',
        lightIcon: '/bottombar/user-light.svg',
    },
]
</script>

<style>
.layout-bg {
    background: #FFFFFF;
}

.content-bg {
    background: #FFFFFF;
}

/* ===== DARK MODE FOR MAIN LAYOUT ===== */
[data-theme="dark"] .layout-bg,
[data-theme="dark"] .content-bg,
[data-theme="dark"] .flex.min-h-screen,
body.dark .layout-bg,
body.dark .content-bg,
body.dark .flex.min-h-screen {
    background: #071824 !important;
}

[data-theme="dark"] body,
body.dark {
    background-color: #071824 !important;
}

/* Desktop Sidebar */
[data-theme="dark"] aside,
body.dark aside {
    background: #161A23 !important;
    border-color: #1E2230 !important;
}

[data-theme="dark"] aside nav a,
body.dark aside nav a {
    color: #9AA4BF !important;
}

[data-theme="dark"] aside nav a:hover,
body.dark aside nav a:hover {
    background: #0f212e !important;
    color: #E8EAED !important;
}

[data-theme="dark"] aside nav a.router-link-active,
[data-theme="dark"] aside nav a.bg-custom-primary,
body.dark aside nav a.router-link-active,
body.dark aside nav a.bg-custom-primary {
    color: #FFFFFF !important;
}

/* Sidebar footer card */
[data-theme="dark"] aside .border-t,
body.dark aside .border-t {
    border-color: #1E2230 !important;
}

[data-theme="dark"] aside .bg-gray-50,
body.dark aside .bg-gray-50 {
    background: #071824 !important;
}

[data-theme="dark"] aside .text-custom-primary,
body.dark aside .text-custom-primary {
    color: #E8EAED !important;
}

[data-theme="dark"] aside .text-gray-500,
body.dark aside .text-gray-500 {
    color: #6D758D !important;
}

/* Main content area background */
[data-theme="dark"] main,
body.dark main {
    background: #071824 !important;
}

/* Trader Profile Icon in Dark Mode */
[data-theme="dark"] .trader-profile-icon,
body.dark .trader-profile-icon {
    filter: brightness(0) invert(1);
    opacity: 0.7;
}
</style>
