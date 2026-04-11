<template>
  <div class="app-container relative">
    <!-- Top Navigation Bar -->
    <div class="nav-bar-full">
      <div class="nav-group">
        <img src="/logo.png" class="w-24 md:hidden" alt="Bull Margin">
      </div>
      <div class="nav-group">
        <div class="nav-title hidden md:block">Margin Apex</div>
      </div>
      <div class="nav-group">
        <div class="nav-icon-btn" @click="showNotificationModal = true"><i class="fas fa-bell"></i></div>
        <div class="nav-icon-btn" @click="toggleTheme"><i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i></div>
      </div>
    </div>

    <!-- Scrollable Main Content -->
    <div class="main-content" v-if="!loading">
      <div class="content-padded">
        
        <!-- TOP BANNERS -->
        <div class="hidden md:grid grid-cols-3 gap-6 mb-8 section-px">
            <img src="/png/banner-1.png" class="rounded-2xl shadow-sm hover:shadow-md transition-shadow" alt="">
            <img src="/png/banner-2.png" class="rounded-2xl shadow-sm hover:shadow-md transition-shadow" alt="">
            <img src="/png/banner-3.png" class="rounded-2xl shadow-sm hover:shadow-md transition-shadow" alt="">
        </div>
        <div class="md:hidden section-px">
            <banner />
        </div>

        <!-- Portfolio Section -->
        <div class="section-px portfolio-wrapper">
          <Portfolio />
        </div>

        <!-- Markets Overview Section -->
        <div class="section-px markets-section">
          <div class="markets-header-row">
            <h2 class="markets-title">Markets Overview</h2>
            <div class="markets-tabs">
              <div v-for="segment in ['Indices', 'Commodities', 'Crypto']" :key="segment"
                   class="market-tab" :class="{ active: activeSegment === segment }" 
                   @click="activeSegment = segment">
                   {{ segment }}
              </div>
            </div>
          </div>

          <div class="markets-grid">
            <div v-for="item in selectedSegment" :key="item.symbol" 
                 class="market-card"
                 :class="getCardClass(item)">
              <div class="market-card-top">
                <span class="market-name">{{ item.symbol.toUpperCase() }}</span>
                <span class="change-badge" :class="getChangeClass(item)">
                  <i class="fas" :class="getChangeIcon(item)"></i>
                  <template v-if="activeSegment !== 'Crypto'">
                    {{ computeChangePercent(tickerStore.getLastPrice(item.script)).toFixed(2) }}%
                  </template>
                  <template v-else>
                    {{ tickerStore.getLastPrice(item.script)?.changepercent?.toFixed(2) || '0.00' }}%
                  </template>
                </span>
              </div>
              <div class="market-card-bottom">
                <span class="market-price">{{ formatNumber(tickerStore.getLastPrice(item.script)?.ltp?.toFixed(2)) || '- -' }}</span>
                <span class="market-change-val" :class="getChangeClass(item)">
                  <template v-if="tickerStore.getLastPrice(item.script)?.change">
                    <span v-if="tickerStore.getLastPrice(item.script)?.change > 0">+</span>{{ tickerStore.getLastPrice(item.script)?.change?.toFixed(2) }}
                  </template>
                  <template v-else>0.00</template>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-else class="flex flex-col justify-center items-center h-[70vh]">
        <loader-component :show="loading" />
    </div>
    <NotificationModal />
  </div>
</template>

<script setup>
import { useTickerStore } from '@/stores/ticker'
import { symbolSegment } from '@/utils/symbolsegment'
import HeaderComponent from '@/components/HeaderComponent.vue'
import Banner from '@/components/Banner.vue'
import { computed, onMounted, ref } from 'vue'
import { formatNumber } from '@/utils/pnl'
import Portfolio from './Portfolio.vue'
import useWatchlistStore from '@/stores/watchlist'
import { storeToRefs } from 'pinia'
import LoaderComponent from '@/components/LoaderComponent.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import { useNotificationStore } from '@/stores/notifications'

const tickerStore = useTickerStore()
const activeSegment = ref('Indices')
const watchlistStore = useWatchlistStore();
const notificationStore = useNotificationStore();

const loading = ref(false);
const { topCommodities } = storeToRefs(watchlistStore)
const { showNotificationModal } = storeToRefs(notificationStore)

const isDark = ref(false);

const applyTheme = (dark) => {
    document.body.classList.toggle('dark', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('marginApexTheme', dark ? 'dark' : 'light')
    localStorage.setItem('app-theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
}

onMounted(async () => {
    const savedTheme = localStorage.getItem('marginApexTheme') || localStorage.getItem('app-theme')
    if (savedTheme === 'dark') {
        isDark.value = true
        applyTheme(true)
    }

    loading.value = true;
    await watchlistStore.getTopCommodities()
    if (topCommodities.value) {
        const tokenMap = topCommodities.value.map(c => c.instrument_token);
        tickerStore.updateTickerList(tokenMap)
    }
    loading.value = false;
})

const indian = ref([
    { symbol: 'NIFTY', script: '256265' },
    { symbol: 'BANKNIFTY', script: '260105' },
    { symbol: 'SENSEX', script: '265' },
    { symbol: 'FINNIFTY', script: '257801' },
    { symbol: 'NIFTYNXT50', script: '270857' },
    { symbol: 'INDIAVIX', script: '264969' },
])

const forex = ref([
    { symbol: 'XAUUSD', script: 'XAUUSD' },
    { symbol: 'USDJPY', script: 'USDJPY' },
    { symbol: 'USDINR', script: 'USDINR' },
])

const crypto = ref([
    { symbol: 'BTCUSDT', script: 'BTCUSDT' },
    { symbol: 'ETHUSDT', script: 'ETHUSDT' },
    { symbol: 'SOLUSDT', script: 'SOLUSDT' },
    { symbol: 'BNBUSDT', script: 'BNBUSDT' },
    { symbol: 'DOGEUSD', script: 'DOGEUSD' },
    { symbol: 'XRPUSD', script: 'XRPUSD' },
])

const commodities = computed(() => {
    if (!topCommodities.value) return
    return topCommodities.value.map(com => {
        const symbol = com.tradingsymbol.replace(/\d.*$/, '').toLowerCase()
        return {
            symbol, 
            script: com.instrument_token
        }
    })
})

const selectedSegment = computed(() => {
    if (activeSegment.value == 'Indices') return indian.value;
    if (activeSegment.value == 'Commodities') return commodities.value;
    if (activeSegment.value == 'Crypto') return crypto.value;
    if (activeSegment.value == 'Forex') return forex.value;
    return []
})

/* ---------------- 🔧 TICK NORMALIZATION ADAPTER ---------------- */
const getTickerKey = (item) => {
    return symbolSegment.includes(item.segment) ? item.symbol : item.token
}

function computeChangePercent(tick) {
    if (!tick || !tick.c) return 0
    return ((tick.ltp - tick.c) / tick.c) * 100
}

function getChangeVal(item) {
    const tick = tickerStore.getLastPrice(item.script)
    if (!tick) return 0
    if (activeSegment.value === 'Crypto') return tick.changepercent || 0
    return tick.change || 0
}

function getChangeClass(item) {
    const val = getChangeVal(item)
    if (val > 0) return 'up'
    if (val < 0) return 'down'
    return 'neutral'
}

function getCardClass(item) {
    const val = getChangeVal(item)
    if (val > 0) return 'card-up'
    if (val < 0) return 'card-down'
    return 'card-neutral'
}

function getChangeIcon(item) {
    const val = getChangeVal(item)
    if (val > 0) return 'fa-caret-up'
    if (val < 0) return 'fa-caret-down'
    return 'fa-minus'
}
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
  --success-color: #10B981;
  --whatsapp-color: #25D366;
  --blue-accent: #2563EB;
}

/* DARK THEME */
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
  --success-color: #34D399;
  --blue-accent: #60A5FA;
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

.text-danger { color: var(--danger-color); }
.text-success { color: var(--success-color); }

.app-container::-webkit-scrollbar { display: none; }
.app-container { -ms-overflow-style: none; scrollbar-width: none; }

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}
.main-content::-webkit-scrollbar { display: none; }

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
  position: sticky;
  top: 0;
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
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.content-padded { padding: 18px 0 0 0; }
.section-px { padding: 0 18px; }

/* ===== PROMO BANNERS CAROUSEL ===== */
.banners-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 14px;
  padding: 0 18px 12px 18px;
  margin-bottom: 12px;
  scrollbar-width: none;
}
.banners-carousel::-webkit-scrollbar { display: none; }

.banner-card {
  min-width: 88%;
  scroll-snap-align: center;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  cursor: pointer;
}
.banner-card:active { transform: scale(0.98); }
.banner-content {
  z-index: 2;
  max-width: 75%;
}
.banner-title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 12px;
}
.banner-sub {
  font-size: 0.65rem;
  opacity: 0.8;
  margin-top: 8px;
  font-weight: 500;
}
.banner-btn {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-block;
}

/* Specific Banner Themes */
.banner-wa { background: linear-gradient(135deg, #25D366, #128C7E); }
.banner-wa .banner-btn { color: #128C7E; }
.banner-wa .bg-icon { font-size: 5.5rem; position: absolute; right: -15px; bottom: -20px; opacity: 0.15; z-index: 1; }

.banner-chart { background: linear-gradient(135deg, #026ca6, #014c77); }
.banner-chart .banner-btn { color: #014c77; }
.banner-chart .bg-icon { font-size: 5rem; position: absolute; right: -10px; bottom: -15px; opacity: 0.15; z-index: 1; }

.banner-quote { background: linear-gradient(135deg, #475569, #1e293b); }
.banner-quote .bg-icon { font-size: 4rem; position: absolute; right: 10px; bottom: -5px; opacity: 0.15; z-index: 1; color: #cbd5e1; }

/* ===== PORTFOLIO CARD ===== */
.portfolio-wrapper { margin-bottom: 24px; }
:deep(.portfolio-card) {
  background: var(--card-bg);
  border-radius: 28px;
  padding: 22px;
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}
:deep(.portfolio-header) { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: var(--text-primary); 
  margin-bottom: 18px; 
}
:deep(.portfolio-stats) { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 16px; 
}
:deep(.stat-col) { display: flex; flex-direction: column; gap: 6px; }
:deep(.stat-col.right) { align-items: flex-end; }
:deep(.stat-label) { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
:deep(.stat-val) { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
:deep(.stat-val.green) { color: var(--success-color); }
:deep(.stat-val.red) { color: var(--danger-color); }
:deep(.pnl-row) { 
  display: flex; 
  justify-content: space-between; 
  padding-top: 16px; 
  border-top: 1px dashed var(--border-light); 
  align-items: center;
}

/* ===== MARKETS OVERVIEW ===== */
.markets-section { margin-bottom: 24px; }
.markets-header-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}
.markets-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}
.markets-tabs {
  display: inline-flex;
  background: var(--card-alt-bg);
  border-radius: 30px;
  padding: 4px;
  border: 1px solid var(--border-light);
  align-self: flex-start;
}
.market-tab {
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 24px;
  cursor: pointer;
}
.market-tab.active {
  background: var(--card-bg);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.markets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.market-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 12px;
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  border-left: 4px solid var(--border-light);
  transition: all 0.2s ease;
  overflow: hidden;
  min-width: 0;
}
.market-card.card-up {
  border-left-color: #10B981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.04), var(--card-bg));
}
.market-card.card-down {
  border-left-color: #EF4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), var(--card-bg));
}
.market-card.card-neutral {
  border-left-color: #9CA3AF;
}
.market-card:active { transform: scale(0.97); }
.market-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.market-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
}

/* Change Badge */
.change-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.change-badge.up {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}
.change-badge.down {
  background: rgba(239, 68, 68, 0.12);
  color: #DC2626;
}
.change-badge.neutral {
  background: rgba(156, 163, 175, 0.12);
  color: #6B7280;
}

.market-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 4px;
  min-width: 0;
}
.market-price {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
}

.market-change-val {
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.market-change-val.up { color: #059669; }
.market-change-val.down { color: #DC2626; }
.market-change-val.neutral { color: #6B7280; }
</style>
