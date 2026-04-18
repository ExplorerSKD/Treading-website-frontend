<template>
  <div class="app-container relative">
    
    <!-- Top Navigation -->
    <AppHeader>
      <template #title-right>
        <div class="nav-left">
          <div class="nav-icon-profile" @click="$router.push('/profile')">
            <i class="fas fa-user"></i>
          </div>
          <div class="nav-title" style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 11px; font-weight: 500; color: #6B7280; text-transform: none; letter-spacing: 0.3px;">Hello 👋</span>
            <span style="font-size: 16px; font-weight: 700; color: #065F46; text-transform: capitalize; letter-spacing: 0;">{{ profile.full_name || 'User' }}</span>
          </div>
        </div>
      </template>
    </AppHeader>

    <!-- Main Scrollable Content -->
    <div class="main-content" v-if="!loading">
      <div class="content-padded">
        


        <Portfolio />

        <!-- Quick Actions -->
        <div class="quick-actions-bar">
          <div class="qa-item" @click="handleDeposit">
            <div class="qa-icon-wrap"><i class="fas fa-wallet"></i></div>
            <span>Deposit</span>
          </div>
          <div class="qa-item" @click="handleWithdraw">
            <div class="qa-icon-wrap"><i class="fas fa-university"></i></div>
            <span>Withdraw</span>
          </div>
          <div class="qa-item" @click="showToast('Refer & Earn')">
            <div class="qa-icon-wrap"><i class="fas fa-gift"></i></div>
            <span>Refer</span>
          </div>
          <div class="qa-item" @click="showToast('Market News')">
            <div class="qa-icon-wrap"><i class="far fa-newspaper"></i></div>
            <span>News</span>
          </div>
          <div class="qa-item" @click="openSupportWhatsApp()">
            <div class="qa-icon-wrap"><i class="fab fa-whatsapp"></i></div>
            <span>Support</span>
          </div>
        </div>

        <!-- Option Chain Section -->
        <div>
          <div class="section-header">
            <div class="section-title"><i class="fas fa-link"></i> OPTION CHAIN</div>
          </div>
          
          <div class="chain-segment">
            <div class="chain-tab" :class="{ active: activeSegment === 'Indices' }" @click="activeSegment = 'Indices'">Indices</div>
            <div class="chain-tab" :class="{ active: activeSegment === 'Commodities' }" @click="activeSegment = 'Commodities'">Commodities</div>
            <div class="chain-tab" :class="{ active: activeSegment === 'Crypto' }" @click="activeSegment = 'Crypto'">Crypto</div>
          </div>

          <div class="instruments-scroll">
            <div class="inst-item" v-for="item in optionChainData" :key="item.name" @click="showToast(`Opening Option Chain: ${item.name}`)">
              <div class="inst-circle"><i :class="item.icon"></i></div>
              <div>
                <div class="inst-name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>



        <!-- Live Market Overview -->
        <div class="lmo-wrapper">
          <div class="section-header" style="margin-bottom: 20px;">
            <div class="section-title"><i class="fas fa-chart-line mr-1"></i> Live Market Overview</div>
            <span style="font-size: 0.75rem; color: var(--text-sub); font-weight: 700; display:flex; align-items:center; gap:4px;">
              <i class="fas fa-sync-alt"></i> LIVE
            </span>
          </div>
          
          <div class="market-grid">
            <div v-for="item in selectedSegment" :key="item.symbol" class="market-card-compact" @click="showToast(`${item.symbol} Data`)">
              <div class="mkt-cmp-icon" :class="item.symbol.toLowerCase().replace(/[^a-z0-9]/g, '')">
                <span>{{ item.symbol.substring(0, 3).toUpperCase() }}</span>
              </div>
              <div class="mkt-cmp-info">
                <div class="mkt-cmp-top-row">
                  <span class="mkt-cmp-name">{{ item.symbol.toUpperCase() }}</span>
                  <span class="mkt-cmp-abs" :class="getChangeClass(item)">
                    <template v-if="activeSegment !== 'Crypto'">
                      {{ (tickerStore.getLastPrice(item.script)?.change || 0) > 0 ? '+' : '' }}{{ (tickerStore.getLastPrice(item.script)?.change || 0).toFixed(2) }}
                    </template>
                    <template v-else>
                      {{ tickerStore.getLastPrice(item.script)?.change > 0 ? '+' : '' }}{{ (tickerStore.getLastPrice(item.script)?.change || 0).toFixed(2) }}
                    </template>
                  </span>
                </div>
                <div class="mkt-cmp-bot-row">
                  <span class="mkt-cmp-price">{{ formatNumber(tickerStore.getLastPrice(item.script)?.ltp?.toFixed(2)) || '- -' }}</span>
                  <span class="mkt-cmp-pct" :class="getChangeClass(item)">
                    <i :class="computeChangePercent(tickerStore.getLastPrice(item.script)) >= 0 ? 'fas fa-xs fa-caret-up' : 'fas fa-xs fa-caret-down'"></i> {{ Math.abs(computeChangePercent(tickerStore.getLastPrice(item.script))).toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
    <div v-else class="flex flex-col justify-center items-center h-[70vh]">
        <loader-component :show="loading" />
    </div>
    <div v-if="toastMsg" class="toast-msg">{{ toastMsg }}</div>

  </div>
</template>

<script setup>
import { useTickerStore } from '@/stores/ticker'
import { symbolSegment } from '@/utils/symbolsegment'
import Banner from '@/components/Banner.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatNumber } from '@/utils/pnl'
import Portfolio from './Portfolio.vue'
import useWatchlistStore from '@/stores/watchlist'
import { storeToRefs } from 'pinia'
import LoaderComponent from '@/components/LoaderComponent.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useProfileStore } from '@/stores/profile'

const tickerStore = useTickerStore()
const activeSegment = ref('Indices')
const watchlistStore = useWatchlistStore();
const router = useRouter()
const walletStore = useWalletStore()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const handleDeposit = () => {
    walletStore.requestMode = 'deposit'
    walletStore.showRequestModal = true
    router.push({ name: 'wallet' })
}

const handleWithdraw = () => {
    walletStore.requestMode = 'withdraw'
    walletStore.showRequestModal = true
    router.push({ name: 'wallet' })
}

const loading = ref(false);
const { topCommodities } = storeToRefs(watchlistStore)

const toastMsg = ref('');

let toastTimer;
const showToast = (msg) => {
    toastMsg.value = msg;
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastMsg.value = '';
    }, 2000);
}

const openSupportWhatsApp = () => {
    const phoneNumber = '919217065816';
    const message = 'Hello, I need support.';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

onMounted(async () => {
    loading.value = true;
    await watchlistStore.getTopCommodities()
    if (topCommodities.value) {
        const tokenMap = topCommodities.value.map(c => c.instrument_token);
        tickerStore.updateTickerList(tokenMap)
    }
    loading.value = false;
})


const optionChainData = computed(() => {
  if (['Indices', 'Forex'].includes(activeSegment.value)) return [
    { name: "NIFTY", icon: "fas fa-chart-line", sub: "50 Stocks" },
    { name: "SENSEX", icon: "far fa-circle", sub: "30 Stocks" },
    { name: "BANKNIFTY", icon: "fas fa-building", sub: "Banking" },
    { name: "FINNIFTY", icon: "fas fa-chart-pie", sub: "Financial" },
    { name: "MIDCAP", icon: "fas fa-chart-area", sub: "Mid Caps" }
  ];
  if (activeSegment.value === 'Crypto') return [
    { name: "BTC", icon: "fab fa-bitcoin", sub: "Bitcoin" },
    { name: "ETH", icon: "fab fa-ethereum", sub: "Ethereum" },
    { name: "SOL", icon: "fas fa-sun", sub: "Solana" },
    { name: "BNB", icon: "fas fa-coins", sub: "Binance" },
    { name: "XRP", icon: "fas fa-bolt", sub: "Ripple" },
    { name: "DOGE", icon: "fas fa-dog", sub: "Dogecoin" }
  ];
  if (activeSegment.value === 'Commodities') return [
    { name: "GOLD", icon: "fas fa-ring", sub: "Spot" },
    { name: "SILVER", icon: "fas fa-gem", sub: "Silver" },
    { name: "CRUDE", icon: "fas fa-oil-can", sub: "Oil" },
    { name: "NATGAS", icon: "fas fa-fire", sub: "Gas" }
  ];
  return []
})

const indian = ref([
    { symbol: 'NIFTY 50', script: '256265' },
    { symbol: 'SENSEX', script: '265' },
    { symbol: 'BANKNIFTY', script: '260105' },
    { symbol: 'FINNIFTY', script: '257801' },
    { symbol: 'MIDCPNIFTY', script: '270857' },
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
    if (!topCommodities.value) return []
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
    if (activeSegment.value === 'Indices') return computeChangePercent(tick) || 0
    return tick.change || 0
}

function getChangeClass(item) {
    const val = getChangeVal(item)
    if (val > 0) return 'up'
    if (val < 0) return 'down'
    return 'neutral'
}

function getChangeIcon(item) {
    const val = getChangeVal(item)
    if (val > 0) return 'fa-caret-up'
    if (val < 0) return 'fa-caret-down'
    return 'fa-minus'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

* {
  box-sizing: border-box;
  transition: background-color 0.25s ease, border-color 0.25s ease, color 0.2s ease, box-shadow 0.25s ease;
}

.app-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  width: 100%;
  margin: 0 auto;
  background: var(--container-bg, #FFFFFF);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
:global(body.dark) .app-container {
  background: #1a1f2d;
  --container-bg: #1a1f2d;
  --text-main: #E8EAED;
  --text-sub: #9AA4BF;
  --border-light: #404047;
  --icon-bg-gray: #1A1F2D;
  --icon-color: #E8EAED;
}

.app-container::-webkit-scrollbar { display: none; }
.app-container { -ms-overflow-style: none; scrollbar-width: none; }

.main-content {
  flex: 1;
  padding-bottom: 0px;
  background: var(--container-bg, #FFFFFF);
}
:global(body.dark) .main-content { background: #1a1f2d; }
.main-content::-webkit-scrollbar { display: none; }
.main-content { -ms-overflow-style: none; scrollbar-width: none; }

/* ===== PROFILE ICON IN HEADER ===== */
.nav-left { display: flex; align-items: center; gap: 12px; }
.nav-icon-profile {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex; align-items: center; justify-content: center;
  color: #4B5563;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}
:global(body.dark) .nav-icon-profile { background: #1A1F2D !important; color: #E8EAED !important; }

.nav-title {
  font-weight: 800;
  letter-spacing: 0.5px;
}
:global(body.dark) .nav-title span:nth-child(1) { color: #10B981 !important; }
:global(body.dark) .nav-title span:nth-child(2) { color: #E8EAED !important; }

.content-padded { padding: 16px 20px 0px 20px; }

/* ===== PROMO BANNER CAROUSEL ===== */
.banner-carousel {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  margin-bottom: 24px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.banner-carousel::-webkit-scrollbar { 
  display: none; 
  width: 0; 
  height: 0; 
}
.banner-carousel::-webkit-scrollbar-track { 
  display: none; 
  background: transparent; 
}
@media (min-width: 768px) {
  .banner-carousel {
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
  }
}
.carousel-img {
  width: 100%;
  display: block;
  flex-shrink: 0;
  border-radius: 24px;
  border: none;
  background: transparent;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  clip-path: inset(0px 0px 4% 0px round 24px);
  scroll-snap-align: start;
  cursor: pointer;
  box-shadow: none;
}
:global(body.dark) .carousel-img { box-shadow: none; }

/* Keep base banner styles for Expiry/Support */
.banner {
  border-radius: 24px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  margin-bottom: 0px;
  cursor: pointer;
}
.banner:active { transform: scale(0.98); }

.banner-icon { font-size: 2.2rem; opacity: 0.9; }

.banner-content { flex: 1; margin-left: 16px; }
.banner-title { font-weight: 800; margin-bottom: 4px; letter-spacing: 0.5px; }
.banner-sub { font-size: 0.75rem; font-weight: 500; opacity: 0.9; }

.arrow-circle {
  background: rgba(255, 255, 255, 0.2);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* ===== QUICK ACTIONS ===== */
.quick-actions-bar {
  display: flex;
  justify-content: space-between;
  background: var(--container-bg, #FFFFFF);
  border: 1px solid var(--border-light, #E5E7EB);
  border-radius: 20px;
  padding: 16px 12px;
  margin-bottom: 28px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02));
}
:global(body.dark) .quick-actions-bar {
  background: #252b36;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  --icon-bg-gray: #Edfdf4;
  --brand-dark-green: #16a34a;
}

.qa-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}
.qa-item:active { transform: scale(0.95); }

.qa-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--icon-bg-gray, #F3F4F6);
  color: var(--brand-dark-green, #1F4529);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.qa-item span {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-sub, #4B5563);
}
:global(body.dark) .qa-item span { color: #E8EAED; }

/* ===== SECTION HEADERS ===== */
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.section-title {
  font-size: 0.85rem; font-weight: 800; color: var(--text-sub, #64748B);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 8px;
}
.section-title i { color: var(--text-icon, #9CA3AF); font-size: 0.9rem;}

/* ===== OPTION CHAIN ===== */
.chain-segment {
  display: inline-flex;
  background: var(--icon-bg-gray, #F3F4F6);
  border-radius: 30px;
  padding: 6px;
  margin-bottom: 24px;
  gap: 6px;
  border: 1px solid var(--border-light, #E5E7EB);
}
:global(body.dark) .chain-segment { background: #252b36; border: 1px solid rgba(255, 255, 255, 0.1); }

.chain-tab {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.75rem; font-weight: 700;
  color: var(--text-sub, #4B5563);
  cursor: pointer;
}

.chain-tab.active {
  background: var(--container-bg, #FFFFFF);
  color: var(--brand-dark-green, #1F4529);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
:global(body.dark) .chain-tab.active { background: #FFFFFF; color: #111827; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

.instruments-scroll {
  display: flex; overflow-x: auto; gap: 18px; padding-bottom: 14px;
  scrollbar-width: none;
}
.instruments-scroll::-webkit-scrollbar { display: none; }

.inst-item {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  min-width: 70px; cursor: pointer;
}
.inst-item:active { transform: scale(0.95); }
.inst-circle {
  width: 65px; height: 65px;
  border-radius: 50%;
  background: var(--container-bg, #FFFFFF);
  border: 1px solid var(--border-light, #E5E7EB);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; color: var(--brand-dark-green, #1F4529);
}
:global(body.dark) .inst-circle { background: #252b36; border: 1px solid rgba(255, 255, 255, 0.1); color: #10B981; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.inst-item:hover .inst-circle { border-color: var(--brand-dark-green, #1F4529); }
:global(body.dark) .inst-item:hover .inst-circle { border-color: #10B981; }

.inst-name { font-size: 0.8rem; font-weight: 800; color: var(--text-main, #0F172A); text-align: center; }
.inst-sub { font-size: 0.65rem; font-weight: 500; color: var(--text-sub, #6B7280); }

/* ===== EXPIRY TODAY ===== */
.banner-expiry { background: linear-gradient(135deg, #EF4444 0%, #991B1B 100%); margin-top: 32px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);}
:global(body.dark) .banner-expiry { background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%); box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);}



/* ===== LIVE MARKET OVERVIEW ===== */
.lmo-wrapper {
  background: var(--container-bg, #FFFFFF);
  border: 1px solid var(--border-light, #E5E7EB);
  border-radius: 20px;
  padding: 18px 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}
:global(body.dark) .lmo-wrapper { 
  background: #252b36; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 480px) {
  .market-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
}

.market-card-compact {
  background: var(--container-bg, #FFFFFF);
  border: 1px solid var(--border-light, #E5E7EB);
  border-radius: 12px;
  padding: 8px 6px;
  display: flex; 
  align-items: center; 
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  min-width: 0;
}
:global(body.dark) .market-card-compact { 
  background: #252b36; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
}
.market-card-compact:active { transform: scale(0.97); }

.mkt-cmp-icon {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #3B82F6;
  color: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mkt-cmp-icon span { font-size: 0.5rem; font-weight: 800; }

/* Assign colors to major indices */
.mkt-cmp-icon.nifty, .mkt-cmp-icon.nifty50 { background: #4F46E5; }
.mkt-cmp-icon.banknifty { background: #D946EF; }
.mkt-cmp-icon.sensex { background: #2563EB; }
.mkt-cmp-icon.finnifty { background: #EAB308; }

.mkt-cmp-info {
  display: flex; flex-direction: column; gap: 2px; flex-grow: 1; overflow: hidden;
}
.mkt-cmp-top-row, .mkt-cmp-bot-row {
  display: flex; justify-content: space-between; align-items: center;
}

.mkt-cmp-name { font-size: 0.6rem; font-weight: 800; color: var(--text-main, #0F172A); letter-spacing:-0.4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 2px;}
.mkt-cmp-price { font-size: 0.65rem; font-weight: 800; color: var(--text-main, #0F172A); letter-spacing:-0.4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
:global(body.dark) .mkt-cmp-name, :global(body.dark) .mkt-cmp-price { color: #E8EAED; }

.mkt-cmp-abs { font-size: 0.6rem; font-weight: 800; white-space: nowrap; flex-shrink: 0;}
.mkt-cmp-pct { font-size: 0.6rem; font-weight: 800; white-space: nowrap; display: flex; align-items: center; gap: 1px; flex-shrink: 0;}

.mkt-cmp-abs.up, .mkt-cmp-pct.up { color: #10B981; }
.mkt-cmp-abs.down, .mkt-cmp-pct.down { color: #EF4444; }
.mkt-cmp-abs.neutral, .mkt-cmp-pct.neutral { color: #6B7280; }

/* TOAST */
.toast-msg {
  position: fixed; bottom: 110px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.85); color: white;
  padding: 10px 20px; border-radius: 30px;
  font-size: 0.85rem; font-weight: 600;
  z-index: 1000; pointer-events: none;
  animation: fadeInOut 2s ease forwards;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  80% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

</style>
