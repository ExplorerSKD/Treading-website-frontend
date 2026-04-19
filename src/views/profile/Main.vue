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
                            {{ (profile?.username || 'D').charAt(0).toUpperCase() }}
                        </div>
                        <div class="profile-info">
                            <h2>{{ profile?.username?.toUpperCase() || 'DEMOACCOUNT' }}</h2>
                            <p>Member Since {{ formatDate(profile?.created_at) || 'Jan 2026' }}</p>
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
                                <p>+91 {{ profile?.parent_number || '9667066657' }}</p>
                            </div>
                        </div>
                        <div class="wa-btn" @click="openWhatsApp">Chat Now</div>
                    </div>

                    <!-- Logout -->
                    <div class="logout-item" @click="showLogoutModal = true">
                        <div class="logout-content">
                            <i class="fas fa-sign-out-alt logout-icon"></i>
                            <span class="logout-text">Logout</span>
                        </div>
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
    --bg-body: #FFFFFF;
    --container-bg: #FFFFFF;
    --card-bg: #FFFFFF;
    --card-alt-bg: #FFFFFF;
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
    --bg-body: #071824;
    --container-bg: #071824;
    --card-bg: #0f212e;
    --card-alt-bg: #0f212e;
    --border-light: #2D3748;
    --border-card: #2D3748;
    --text-primary: #F5F5F5;
    --text-secondary: #B0B0B0;
    --text-muted: #888888;
    --icon-bg: #0f212e;
    --wallet-bg: #0f212e;
    --wallet-text: #F5F5F5;
    --nav-bg: #071824;
    --nav-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    --nav-border: #2D3748;
    --footer-bg: #071824;
    --footer-active: #EF5350;
    --danger-color: #EF4444;
}

.app-container {
    width: 100%;
    margin: 0 auto;
    background: var(--bg-body);
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
    font-size: calc(1.1rem * var(--font-scale));
}
.nav-icon-btn:active { transform: scale(0.94); background: var(--border-card); }

.nav-title {
    font-weight: 700;
    font-size: calc(1.1rem * var(--font-scale));
    color: var(--text-primary);
    letter-spacing: 0.5px;
}

.content-padded { padding: 16px 18px 0 18px; }

/* ===== PROFILE HEADER ===== */
.profile-header {
    background: #1E2331;
    border-radius: 45px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
:global(body.dark) .profile-header {
    background: var(--card-bg);
    border: 1px solid var(--border-light);
}
.profile-avatar {
    width: 70px;
    height: 70px;
    background: #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(2rem * var(--font-scale));
    font-weight: 800;
    color: #1E2331;
}
.profile-info h2 {
    color: #FFFFFF;
    font-size: calc(1.3rem * var(--font-scale));
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
}
.profile-info p {
    color: rgba(255, 255, 255, 0.4);
    font-size: calc(0.85rem * var(--font-scale));
    font-weight: 500;
}

/* ===== SETTINGS LIST GROUP ===== */
.settings-group {
    background: #FFFFFF;
    border-radius: 45px;
    overflow: hidden;
    margin-bottom: 24px;
    padding: 12px 0;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}
:global(body.dark) .settings-group {
    background: var(--card-bg);
    border: 1px solid var(--border-light);
}
.settings-item {
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: none;
    cursor: pointer;
}
.settings-item:last-child {
    border-bottom: none;
}
.settings-item:active {
    background-color: rgba(0, 0, 0, 0.02);
}
:global(body.dark) .settings-item:active {
    background-color: rgba(255, 255, 255, 0.05);
}
.settings-left {
    display: flex;
    align-items: center;
    gap: 20px;
}
.settings-icon {
    color: #1E2331;
    font-size: calc(1.25rem * var(--font-scale));
    width: 28px;
    text-align: center;
}
:global(body.dark) .settings-icon {
    color: var(--text-primary);
}
.settings-text {
    font-size: calc(1.05rem * var(--font-scale));
    font-weight: 700;
    color: #1E2331;
}
:global(body.dark) .settings-text {
    color: var(--text-primary);
}

/* ===== WHATSAPP SUPPORT CARD ===== */
.wa-card {
    background: #F1F6F9;
    border-radius: 35px;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    border: none;
}
:global(body.dark) .wa-card {
    background: var(--card-bg);
    border: 1px solid var(--border-light);
}
.wa-info {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}
.wa-icon-large {
    font-size: calc(2.4rem * var(--font-scale));
    color: #25D366;
    flex-shrink: 0;
}
.wa-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.wa-details h4 {
    font-size: calc(0.85rem * var(--font-scale));
    font-weight: 600;
    color: #8E96A4;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.wa-details p {
    font-size: calc(1.1rem * var(--font-scale));
    font-weight: 800;
    color: #1E2331;
    white-space: nowrap;
}
:global(body.dark) .wa-details p {
    color: var(--text-primary);
}
.wa-btn {
    background: #25D366;
    color: #FFFFFF;
    padding: 12px 28px;
    border-radius: 35px;
    font-size: calc(0.95rem * var(--font-scale));
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(37, 211, 102, 0.2);
    flex-shrink: 0;
}
.wa-btn:active {
    transform: scale(0.96);
}

/* ===== LOGOUT BUTTON ===== */
.logout-item {
    padding: 16px 32px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 30px;
    margin-bottom: 20px;
}
:global(body.dark) .logout-item {
    background: var(--card-bg);
    border: 1px solid var(--border-light);
}
.logout-content {
    display: flex;
    align-items: center;
    gap: 20px;
}
.logout-item:active {
    background-color: rgba(0, 0, 0, 0.02);
}
:global(body.dark) .logout-item:active {
    background-color: rgba(255, 255, 255, 0.05);
}
.logout-icon {
    color: #1E2331;
    font-size: calc(1.25rem * var(--font-scale));
    width: 28px;
    text-align: center;
}
:global(body.dark) .logout-icon {
    color: var(--text-primary);
}
.logout-text {
    font-size: calc(1.05rem * var(--font-scale));
    font-weight: 700;
    color: #1E2331;
}
:global(body.dark) .logout-text {
    color: var(--text-primary);
}

/* ===== RESPONSIVE MEDIA QUERIES ===== */
@media (max-width: 600px) {
    .content-padded {
        padding: 12px 14px 0 14px;
    }
    
    .profile-header {
        border-radius: 30px;
        padding: 20px;
        gap: 16px;
        margin-bottom: 20px;
    }
    
    .profile-avatar {
        width: 60px;
        height: 60px;
        font-size: calc(1.6rem * var(--font-scale));
    }
    
    .profile-info h2 {
        font-size: calc(1.15rem * var(--font-scale));
    }
    
    .settings-group {
        border-radius: 30px;
        margin-bottom: 20px;
    }
    
    .settings-item {
        padding: 16px 24px;
    }
    
    .settings-icon {
        font-size: calc(1.1rem * var(--font-scale));
        width: 24px;
    }
    
    .settings-text {
        font-size: calc(0.95rem * var(--font-scale));
    }
    
    .wa-card {
        border-radius: 28px;
        padding: 16px 20px;
        margin-bottom: 20px;
        gap: 12px;
    }
    
    .wa-info {
        gap: 12px;
    }
    
    .wa-icon-large {
        font-size: calc(2rem * var(--font-scale));
    }
    
    .wa-details h4 {
        font-size: calc(0.75rem * var(--font-scale));
    }
    
    .wa-details p {
        font-size: calc(0.95rem * var(--font-scale));
    }
    
    .wa-btn {
        padding: 10px 20px;
        font-size: calc(0.85rem * var(--font-scale));
        border-radius: 25px;
    }
    
    .logout-item {
        padding: 14px 24px;
        border-radius: 20px;
    }
    
    .logout-icon {
        font-size: calc(1.1rem * var(--font-scale));
        width: 24px;
    }
    
    .logout-text {
        font-size: calc(0.95rem * var(--font-scale));
    }
}

@media (max-width: 380px) {
    .wa-card {
        padding: 14px 16px;
    }
    
    .wa-btn {
        padding: 8px 16px;
        font-size: calc(0.8rem * var(--font-scale));
    }
    
    .wa-details p {
        font-size: calc(0.85rem * var(--font-scale));
    }
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
    font-size: calc(1.4rem * var(--font-scale));
    color: #DC2626;
}

.logout-modal-title {
    font-size: calc(1.1rem * var(--font-scale));
    font-weight: 700;
    color: #1A1A1A;
    margin-bottom: 8px;
}

.logout-modal-desc {
    font-size: calc(0.8rem * var(--font-scale));
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
    font-size: calc(0.85rem * var(--font-scale));
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

[data-theme="dark"] .logout-item,
body.dark .logout-item {
    background: #1E2230 !important;
    border: 1px solid #2D3748 !important;
}

[data-theme="dark"] .logout-text,
body.dark .logout-text,
[data-theme="dark"] .logout-icon,
body.dark .logout-icon {
    color: #FFFFFF !important;
}
</style>
