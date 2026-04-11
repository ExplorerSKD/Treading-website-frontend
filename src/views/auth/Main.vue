<template>
    <div v-if="currentTab == ''"
        class="bg-[url('/png/login-bg.webp')] flex items-center justify-center min-h-screen overflow-hidden w-full bg-cover bg-center bg-no-repeat p-4">
        <div class="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 py-8">

            <!-- Branding & Feature Image Column -->
            <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <img src="/logo.png" class="mb-8 w-44 md:w-64" alt="Bull Margin Logo">

                <div class="hidden md:block mb-12 space-y-4">
                    <h1 class="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
                        Trade <span class="text-yellow-500">500x</span> Margins<br>
                        With BullMargin
                    </h1>
                    <p class="text-lg text-white/70 max-w-lg">
                        Experience the ultimate margin advantage with lightning-fast execution, 
                        lowest brokerage, and 24/7 dedicated support.
                    </p>
                </div>

                <div class="relative group">
                    <div
                        class="absolute -inset-4 bg-yellow-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div>
                    <img src="/png/dabba.webp" alt="Features"
                        class="relative w-72 md:w-full max-w-lg drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:scale-[1.02]">
                </div>
            </div>


            <!-- Action Column -->
            <div
                class="w-full md:max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
                <div class="space-y-8">
                    <div class="text-center md:text-left">
                        <h2 class="text-3xl font-bold text-white mb-2">Get Started</h2>
                        <p class="text-white/60">Choose an option to continue</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                        <button @click="currentTab = 'login'"
                            class="rounded-xl py-4 px-4 bg-white text-custom-primary font-bold shadow-xl transition-all hover:bg-gray-100 active:scale-95">
                            Login
                        </button>
                        <button @click="currentTab = 'register'"
                            class="rounded-xl py-4 px-4 text-white font-bold hover:bg-white/5 transition-colors">
                            Register
                        </button>
                    </div>

                    <div class="relative flex items-center gap-4 py-2">
                        <div class="h-px bg-white/10 w-full "></div>
                        <p class="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">OR</p>
                        <div class="h-px bg-white/10 w-full "></div>
                    </div>

                    <button @click="handleDemoLogin"
                        class="group relative w-full py-5 rounded-2xl border border-yellow-500/30 text-yellow-500 font-bold overflow-hidden transition-all hover:border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                        <div
                            class="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                        <span class="relative flex items-center justify-center gap-2">
                            Try Demo Account
                            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>

                    <div class="pt-4 flex flex-wrap justify-center md:justify-start gap-6 text-white/40 text-xs">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Secure Trading
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Instant Deposit
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="currentTab == 'login'" class="w-full min-h-screen flex items-center bg-[#0b3200]">
        <Login @goBack="currentTab = ''" class="w-full" />
    </div>
    <div v-else-if="currentTab == 'register'" class="w-full min-h-screen flex items-center bg-[#0b3200]">
        <Register @goBack="currentTab = ''" @goTologin="currentTab = 'login'" :referral="route.query" class="w-full" />
    </div>
</template>

<script setup>
import { makeRequest, setTokenAndRole, setisAuthenticated, getToken, getisAuthenticated } from '@/request/requests';
import { useTickerStore } from '@/stores/ticker';
import { useToastStore } from '@/stores/utils/toast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Login from './Login.vue';
import Register from './Register.vue';


const toastStore = useToastStore();
const route = useRoute();
const router = useRouter()
const loading = ref(false);
const error = ref(null);
const token = ref(localStorage.getItem('token') || null)
const isAuthenticated = ref(!!token.value);
const currentTab = ref('')


async function handleDemoLogin() {


    loading.value = true;
    error.value = null;

    try {
        const res = await makeRequest("demoLogin", "POST");
        if (!res) {
            error.value = res.error || "Something went wrong";
            toastStore.addToast("Error", error.value, "error", 3000);
            return;
        }

        if (res?.access_token) {
            token.value = `Bearer ${res.access_token}`;
            localStorage.setItem("token", token.value);
            isAuthenticated.value = true;

            // Set token & role
            setTokenAndRole(token.value, "user");

            // Start websocket safely
            setTimeout(() => {
                const rawToken = token.value?.replace("Bearer ", "") || "";
                useTickerStore().startWebSocket(rawToken);
            }, 1000);

            router.push({ name: "market" });
        }
    } catch (err) {
        console.error("Login error:", err);
        error.value = "Unable to login. Please try again.";
        toastStore.addToast("Error", error.value, "error", 3000);
    } finally {
        loading.value = false;
    }
}


onMounted(() => {
    if (route.query?.referral) {
        currentTab.value = 'register'
    }
})
</script>

<style lang="scss" scoped></style>