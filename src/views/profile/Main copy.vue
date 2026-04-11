<template>
    <div class="p-4 md:p-6 ">

        <!-- <div class="my-4 rounded-lg bg-custom-primary p-4 ">
            <div class="flex items-center justify-between">
                <p class="text-2xl font-semibold mb-4 text-white">Available Balance</p>
                <p v-if="profile.is_demo"
                    class="text-[14px] font-semibold mb-4 py-1 text-white border border-white rounded-full px-2">Demo
                    Account
                </p>

            </div>
            <p class="font-semibold text-[19.2px] text-white">₹{{ wallet?.balance || '- -' }}</p>
        </div> -->


        <!-- HEADER -->
        <header-component title="Profile" />



        <!-- ACTION BUTTONS -->
        <div class="flex flex-wrap gap-3 mb-6">
            <button v-for="item in menu" :key="item.key" @click="activeSection = item.key"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors" :class="activeSection === item.key
                    ? 'bg-custom-primary text-white'
                    : 'text-custom-text border border-custom-border hover:bg-custom-primary/5'">
                {{ item.label }}
            </button>
        </div>

        <!-- DYNAMIC SECTION -->
        <component :is="activeComponent" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import ProfileHome from './ProfileHome.vue'
import ProfileMargin from './ProfileMargin.vue'
import ProfileLedger from './ProfileLedger.vue'
import ProfileChangePassword from './ProfileChangePassword.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

const activeSection = ref('home')

const menu = [
    { key: 'home', label: 'Profile' },
    { key: 'margin', label: 'Margin' },
    // { key: 'ledger', label: 'Ledger Logs' },
    // { key: 'password', label: 'Change Password' },

]

const componentMap = {
    home: ProfileHome,
    margin: ProfileMargin,
    ledger: ProfileLedger,
    password: ProfileChangePassword,
}

const activeComponent = computed(() => componentMap[activeSection.value])
</script>
