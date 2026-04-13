<template>
    <div v-if="currentTab == ''"
        class="bg-[url('/png/login-bg.webp')] flex items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat p-4 md:p-8">
        <div class="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-20">

            <!-- Branding & Feature Image Section (Desktop Only) -->
            <div class="flex-1 hidden md:flex flex-col items-center md:items-start text-center md:text-left w-full">
                <img src="/logo.png" class="mb-10 w-64" alt="Bull Margin Logo">

                <div class="mb-14 space-y-6">
                    <h1 class="text-5xl lg:text-7xl font-extrabold text-white leading-tight">
                        Trade <span class="text-yellow-500">500x</span> Margins<br>
                        With BullMargin
                    </h1>
                    <p class="text-xl text-white/70 max-w-lg">
                        Experience the ultimate margin advantage with lightning-fast execution, 
                        lowest brokerage, and 24/7 dedicated support.
                    </p>
                </div>

                <div class="relative group w-full">
                    <div class="absolute -inset-4 bg-yellow-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src="/png/dabba.webp" alt="Features"
                        class="relative w-full max-w-xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:scale-[1.02]">
                </div>
            </div>

            <!-- Mobile View: Logo & Headline (Hidden on Desktop) -->
            <div class="flex md:hidden flex-col items-center text-center w-full pt-4 mb-4">
                <img src="/logo.png" class="mb-4 w-32" alt="Bull Margin Logo">
                <h1 class="text-2xl font-extrabold text-white leading-tight">
                    Trade <span class="text-yellow-500">500x</span> Margins<br>
                    With BullMargin
                </h1>
            </div>


            <!-- Right Side: Action Card & Features -->
            <div class="w-full md:max-w-md flex flex-col gap-6 md:gap-8">
                <!-- Action Card -->
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
                    <div class="space-y-6 md:space-y-8">
                        <div class="text-center md:text-left">
                            <h2 class="text-2xl md:text-4xl font-bold text-white mb-1">Get Started</h2>
                            <p class="text-white/60 text-xs sm:text-base">Choose an option to continue</p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-black/40 border border-white/10">
                            <button @click="currentTab = 'login'"
                                class="rounded-xl py-3 sm:py-4 px-4 bg-white text-custom-primary font-bold shadow-xl transition-all hover:bg-gray-100 active:scale-95 text-sm sm:text-base">
                                Login
                            </button>
                            <button @click="currentTab = 'register'"
                                class="rounded-xl py-3 sm:py-4 px-4 text-white font-bold hover:bg-white/5 transition-colors text-sm sm:text-base">
                                Register
                            </button>
                        </div>

                        <div class="relative flex items-center gap-4 py-1">
                            <div class="h-px bg-white/10 w-full "></div>
                            <p class="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">OR</p>
                            <div class="h-px bg-white/10 w-full "></div>
                        </div>

                        <button @click="handleDemoLogin"
                            class="group relative w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl border border-yellow-500/30 text-yellow-500 font-bold overflow-hidden transition-all hover:border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.05)] text-sm sm:text-base">
                            <div class="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span class="relative flex items-center justify-center gap-2">
                                Try Demo Account
                                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Mobile Features Image (Positioned below buttons) -->
                <div class="w-full md:hidden pt-4">
                    <img src="/png/dabbas.jpg" alt="Features" class="w-full rounded-2xl shadow-2xl border border-white/10">
                </div>

                <!-- Security Badges (Hidden on mobile to save space) -->
                <div class="hidden md:flex flex-wrap justify-start gap-6 text-white/40 text-xs">
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
    <div v-else-if="currentTab == 'login'" class="w-full min-h-screen flex items-center bg-[#0b3200]">
        <Login @goBack="currentTab = ''" @goToRegister="currentTab = 'register'" class="w-full" />
    </div>
    <div v-else-if="currentTab == 'register'" class="w-full min-h-screen flex items-center bg-[#0b3200]">
        <Register @goBack="currentTab = 'login'" @goTologin="currentTab = 'login'" @demoLogin="handleDemoLogin" :referral="route.query" class="w-full" />
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
const currentTab = ref('login')


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