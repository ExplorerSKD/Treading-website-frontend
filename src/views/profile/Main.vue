<template>
    <div class="app-container">
        <!-- Top Navigation Bar -->
        <div class="nav-bar-full">
            <div class="nav-group">
                <!-- If profile doesn't need to go back, we can just leave it or router.back() -->
                <div class="nav-icon-btn" @click="router.back()">
                    <i class="fas fa-arrow-left"></i>
                </div>
            </div>
            <div class="nav-group">
                <div class="nav-title">Profile</div>
            </div>
            <div class="nav-group">
            </div>
        </div>

        <!-- Scrollable Main Content -->
        <div class="main-content">
            <div class="screen">
                <div class="content-padded">

                    <!-- Profile Header -->
                    <div class="profile-header">
                        <div class="profile-avatar">
                            {{ (profile?.full_name || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <div class="profile-info">
                            <h2>{{ profile?.username }}</h2>
                            <p>Member Since {{ formatDate(profile?.created_at) }}</p>
                        </div>
                    </div>

                    <!-- Settings List -->
                    <div class="settings-group">

                        <div class="settings-item" @click="router.push('/wallet')">
                            <div class="settings-left">
                                <i class="fas fa-wallet settings-icon"></i>
                                <span class="settings-text">Wallet</span>
                            </div>
                        </div>

                        <div class="settings-item" @click="changePasswordOpen = true">
                            <div class="settings-left">
                                <i class="fas fa-key settings-icon"></i>
                                <span class="settings-text">Change Password</span>
                            </div>
                        </div>

                        <div class="settings-item" @click="router.push({ name: 'ledger' })">
                            <div class="settings-left">
                                <i class="fas fa-sliders-h settings-icon"></i>
                                <span class="settings-text">Margin Settings</span>
                            </div>
                        </div>

                        <div class="settings-item" @click="router.push({ name: 'trade-reports' })">
                            <div class="settings-left">
                                <i class="fas fa-file-invoice-dollar settings-icon"></i>
                                <span class="settings-text">Trade Logs</span>
                            </div>
                        </div>

                        <div class="settings-item">
                            <div class="settings-left">
                                <i class="fas fa-file-contract settings-icon"></i>
                                <span class="settings-text">Terms and Conditions</span>
                            </div>
                        </div>

                        <div class="settings-item">
                            <div class="settings-left">
                                <i class="fas fa-shield-alt settings-icon"></i>
                                <span class="settings-text">Privacy Policy</span>
                            </div>
                        </div>

                    </div>

                    <!-- WhatsApp Support Card -->
                    <div class="wa-card">
                        <div class="wa-info">
                            <i class="fab fa-whatsapp wa-icon-large"></i>
                            <div class="wa-details">
                                <h4>WhatsApp Support</h4>
                                <p>+91 {{ profile?.parent_number || '- -' }}</p>
                            </div>
                        </div>
                        <div class="wa-btn" @click="openWhatsApp">Chat Now</div>
                    </div>

                    <!-- Logout -->
                    <div class="logout-item" @click="showLogoutModal = true">
                        <i class="fas fa-sign-out-alt logout-icon"></i>
                        <span class="logout-text">Logout</span>
                    </div>

                </div>
            </div>
            
            <ChangePassword :is-open="changePasswordOpen" @close="changePasswordOpen = false" @submit="handlePassword" />

            <!-- Logout Confirmation Modal -->
            <div v-if="showLogoutModal" class="logout-overlay" @click.self="showLogoutModal = false">
                <div class="logout-modal">
                    <div class="logout-modal-icon">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h3 class="logout-modal-title">Logout</h3>
                    <p class="logout-modal-desc">Are you sure you want to logout from your account?</p>
                    <div class="logout-modal-actions">
                        <button class="logout-modal-btn cancel" @click="showLogoutModal = false">Cancel</button>
                        <button class="logout-modal-btn confirm" @click="confirmLogout">Yes, Logout</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import ChangePassword from '@/components/changePassword.vue'
import { logout } from '@/request/requests'

const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const router = useRouter()

const changePasswordOpen = ref(false)
const showLogoutModal = ref(false)

const formatDate = (dateStr) => {
    if (!dateStr) return "";

    dateStr = dateStr.replace('GMT', ' ');
    const date = new Date(dateStr);

    return new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
    }).format(date);
}

const handlePassword = (payload) => {
    profileStore.changePassword(payload)
    changePasswordOpen.value = true
}

const confirmLogout = () => {
    showLogoutModal.value = false
    logout()
}

const openWhatsApp = () => {
    const phoneNumber = profile.value?.parent_number;
    if (!phoneNumber) {
        console.error("Phone number is missing");
        return;
    }
    const message = 'Hello, I need support.'
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappURL, '_blank')
}

onMounted(() => {
    const savedTheme = localStorage.getItem('marginApexTheme')
    if (savedTheme === 'dark') {
        document.body.classList.add('dark')
    }
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap');

* {
    box-sizing: border-box;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}

/* JADE RED + WHITE + BLACK + SILVER THEME */
:root {
    --bg-body: #F0F2F5;
    --container-bg: #FFFFFF;
    --card-bg: #FFFFFF;
    --card-alt-bg: #F8F9FB;
    --border-light: #E8ECF0;
    --border-card: #E2E6EA;
    --text-primary: #1A1A1A;
    --text-secondary: #6B7280;
    --text-muted: #9CA3AF;
    --icon-bg: #F3F4F6;
    --wallet-bg: #1A1A1A;
    --wallet-text: #FFFFFF;
    --nav-bg: #FFFFFF;
    --nav-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    --nav-border: #E8ECF0;
    --footer-bg: #FFFFFF;
    --footer-active: #C62828;
    --danger-color: #DC2626;
    --whatsapp-color: #25D366;
}

/* DARK THEME SUPPORT via global body.dark */
:global(body.dark) {
    --bg-body: #121212;
    --container-bg: #1E1E1E;
    --card-bg: #252525;
    --card-alt-bg: #2A2A2A;
    --border-light: #333333;
    --border-card: #3A3A3A;
    --text-primary: #F5F5F5;
    --text-secondary: #B0B0B0;
    --text-muted: #888888;
    --icon-bg: #2A2A2A;
    --wallet-bg: #2D2D2D;
    --wallet-text: #F5F5F5;
    --nav-bg: #1E1E1E;
    --nav-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    --nav-border: #333333;
    --footer-bg: #1E1E1E;
    --footer-active: #EF5350;
    --danger-color: #EF4444;
}

.app-container {
    width: 100%;
    margin: 0 auto;
    background: var(--container-bg);
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', sans-serif;
}

.app-container::-webkit-scrollbar { display: none; }
.app-container { -ms-overflow-style: none; scrollbar-width: none; }

.main-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
}
.main-content::-webkit-scrollbar { display: none; }

.screen { padding: 0 0 20px 0; }

/* ===== TOP NAVIGATION BAR ===== */
.nav-bar-full {
    background: var(--nav-bg);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--nav-shadow);
    border-bottom: 1px solid var(--nav-border);
    width: 100%;
    position: relative;
    z-index: 10;
}
.nav-group { display: flex; align-items: center; gap: 16px; }
.nav-icon-btn {
    background: var(--icon-bg);
    width: 40px;
    height: 40px;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 1.1rem;
}
.nav-icon-btn:active { transform: scale(0.94); background: var(--border-card); }

.nav-title {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-primary);
    letter-spacing: 0.5px;
}

.content-padded { padding: 16px 18px 0 18px; }

/* ===== PROFILE HEADER ===== */
.profile-header {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    border-radius: 28px;
    padding: 24px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
}
.profile-avatar {
    width: 56px;
    height: 56px;
    background: #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 800;
    color: #0f172a;
}
.profile-info h2 {
    color: #FFFFFF;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 4px;
}
.profile-info p {
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 500;
}

/* ===== SETTINGS LIST GROUP ===== */
.settings-group {
    background: var(--card-bg);
    border-radius: 28px;
    border: 1px solid var(--border-light);
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.settings-item {
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
}
.settings-item:last-child {
    border-bottom: none;
}
.settings-item:active {
    background-color: var(--card-alt-bg);
}
.settings-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.settings-icon {
    color: var(--text-primary);
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
    opacity: 0.8;
}
.settings-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
}

/* ===== WHATSAPP SUPPORT CARD ===== */
.wa-card {
    background: #E8ECEF;
    border-radius: 20px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    border: none;
}
.wa-info {
    display: flex;
    align-items: center;
    gap: 14px;
}
.wa-icon-large {
    font-size: 2.2rem;
    color: #25D366;
}
.wa-details h4 {
    font-size: 0.8rem;
    font-weight: 600;
    color: #5B677E;
    margin-bottom: 2px;
}
.wa-details p {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
}
.wa-btn {
    background: #25D366;
    color: #FFFFFF;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15);
}
.wa-btn:active {
    transform: scale(0.96);
}

/* ===== LOGOUT BUTTON ===== */
.logout-item {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    border-radius: 24px;
    margin-bottom: 20px;
}
.logout-item:active {
    background-color: rgba(220, 38, 38, 0.05);
}
.logout-icon {
    color: var(--danger-color);
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
}
.logout-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--danger-color);
}

/* ===== LOGOUT CONFIRMATION MODAL ===== */
.logout-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.logout-modal {
    background: #FFFFFF;
    border-radius: 28px;
    padding: 32px 28px 24px;
    max-width: 320px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.25s ease;
}

.logout-modal-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(220, 38, 38, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 1.4rem;
    color: #DC2626;
}

.logout-modal-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1A1A1A;
    margin-bottom: 8px;
}

.logout-modal-desc {
    font-size: 0.8rem;
    color: #6B7280;
    line-height: 1.5;
    margin-bottom: 24px;
}

.logout-modal-actions {
    display: flex;
    gap: 12px;
}

.logout-modal-btn {
    flex: 1;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}

.logout-modal-btn.cancel {
    background: #F3F4F6;
    color: #4B5563;
}

.logout-modal-btn.cancel:active {
    background: #E5E7EB;
}

.logout-modal-btn.confirm {
    background: #DC2626;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.logout-modal-btn.confirm:active {
    background: #B91C1C;
    transform: scale(0.97);
}
</style>

<style>
/* ===== DARK MODE OVERRIDES FOR PROFILE ===== */
[data-theme="dark"] .wa-card,
body.dark .wa-card {
    background: #1E2230 !important;
}

[data-theme="dark"] .wa-details h4,
body.dark .wa-details h4 {
    color: #9AA4BF !important;
}

[data-theme="dark"] .wa-details p,
body.dark .wa-details p {
    color: #E8EAED !important;
}
</style>
