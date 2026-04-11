import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    // 1. Check local storage, fallback to light
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    const isDark = ref(savedTheme === 'dark')

    // 2. Setup watcher to apply to html root
    watch(isDark, (newVal) => {
        const themeStr = newVal ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', themeStr)
        localStorage.setItem('app-theme', themeStr)
    }, { immediate: true })

    // 3. Toggle function
    const toggleTheme = () => {
        isDark.value = !isDark.value
    }

    return {
        isDark,
        toggleTheme
    }
})
