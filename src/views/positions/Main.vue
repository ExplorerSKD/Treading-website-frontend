<template>
  <div class="positions-app">

    <AppHeader title="Positions">
      <template #actions>
        <button 
           class="exit-all-btn" 
           id="exitAllBtn"
           :class="{ 'disabled': positionStore.openPositions.length === 0 }"
           @click="positionStore.openPositions.length > 0 && (showConfirmationModal = true)"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Exit All</span>
        </button>
      </template>
    </AppHeader>

    <!-- Main Navigation Tabs -->
    <div class="main-nav">
      <div 
         class="main-tab" 
         :class="{ 'active': currentMain === 'cumulative' }" 
         @click="setMain('cumulative')"
      >
         Cumulative P&L
      </div>
      <div 
         class="main-tab" 
         :class="{ 'active': currentMain === 'detailed' }" 
         @click="setMain('detailed')"
      >
         Detailed P&L
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content" id="pageContent">

       <div v-if="loading" class="py-8 flex justify-center text-gray-400">
          <LoaderComponent :show="true" />
       </div>
       
       <div v-else>
          <!-- Cumulative View -->
          <div v-if="currentMain === 'cumulative'">

             <!-- P&L Summary (Only for Open / Cumulative) -->
             <div class="pnl-summary-card">
               <div class="summary-header">
                 <span>Active P&L Summary</span>
               </div>
               <div class="summary-stats">
                 <div class="summary-left">
                   <div class="summary-label">Realized</div>
                   <div class="summary-value" :class="realizedPnl >= 0 ? 'positive' : 'negative'">{{ formatUSD(realizedPnl) }}</div>
                 </div>
                 <div class="summary-center">
                   <div class="center-value" :class="totalPnl >= 0 ? 'positive' : 'negative'" style="color: inherit">{{ formatUSD(totalPnl) }}</div>
                 </div>
                 <div class="summary-right">
                   <div class="summary-label">Unrealized</div>
                   <div class="summary-value" :class="totalPnl >= 0 ? 'positive' : 'negative'">{{ formatUSD(totalPnl) }}</div>
                 </div>
               </div>
             </div>

             <!-- Sub Nav -->
             <div class="sub-nav">
               <div class="sub-tab" :class="{ 'active': activePositionTab === 'OPEN' }" @click="activePositionTab = 'OPEN'">
                  Open Positions
               </div>
               <div class="sub-tab" :class="{ 'active': activePositionTab === 'CLOSED' }" @click="activePositionTab = 'CLOSED'">
                  Closed Positions
               </div>
             </div>

             <!-- Position List -->
             <div v-if="!positions.length" class="empty-state">
                <i class="fas fa-chart-simple" style="font-size: calc(24px * var(--font-scale)); margin-bottom: 6px; opacity: 0.4; display: block;"></i>
                No {{ activePositionTab.toLowerCase() }} positions
             </div>

             <div v-else>
               <div 
                 v-for="pos in positions" 
                 :key="pos.id"
                 class="compact-position-card"
                 @click="openExitModal(pos)"
               >
                 <div class="pos-left">
                   <div class="pos-symbol flex items-center gap-2">
                       {{ pos.symbol }} 
                       <span class="text-[calc(0.6rem*var(--font-scale))] bg-gray-100 text-gray-500 px-1 font-semibold rounded">{{ pos.exchange }}</span>
                   </div>
                   <div class="pos-details">
                     <span>Avg Price: <span class="value">{{ formatPrice(pos.average_price) }}</span></span>
                     <span>Quantity: <span class="value">{{ activePositionTab === 'CLOSED' ? (pos.side === 'BUY' ? pos.buy_quantity : pos.sell_quantity) : pos.net_quantity }}</span></span>
                   </div>
                 </div>
                 <div class="pos-right">
                   <div class="order-type-badge" :class="pos.side === 'BUY' ? 'long' : 'short'">
                       {{ pos.side }}
                   </div>
                   <div class="pnl-right-value" :class="getPnlClass(activePositionTab === 'CLOSED' ? getDisplayedPnl(pos) - pos.brokerage : getDisplayedPnl(pos))">
                     <span v-if="(activePositionTab === 'CLOSED' ? getDisplayedPnl(pos) - pos.brokerage : getDisplayedPnl(pos)) >= 0">+</span>{{ formatUSD(activePositionTab === 'CLOSED' ? getDisplayedPnl(pos) - pos.brokerage : getDisplayedPnl(pos)) }}
                   </div>
                   
                   <div v-if="activePositionTab === 'CLOSED'" class="ltp-value">
                     Exit: <span>{{ getExitPrice(pos) }}</span>
                     <div class="text-[calc(0.55rem*var(--font-scale))] mt-1 text-gray-400">Bkg: ₹{{ formatNumber(pos.brokerage) }}</div>
                   </div>
                   <div v-else class="ltp-value">
                     LTP: <span>{{ formatPrice(getLive(pos).ltp) }}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>


          <!-- Detailed View (ACTIVE) -->
          <div v-if="currentMain === 'detailed'" class="detailed-page">
             <div class="section-title-small">Detailed Positions</div>
             
             <div v-if="!positions.length" class="empty-state">
                <i class="fas fa-chart-line" style="font-size: calc(20px * var(--font-scale)); margin-bottom: 8px; opacity: 0.4; display: block;"></i>
                No positions found
             </div>
             
             <div v-else class="individual-positions-list">
                 <div v-for="pos in positions" :key="pos.id" class="individual-pnl-card" @click="openExitModal(pos)">
                    <div class="pnl-left-info" style="flex:1">
                      <div class="pnl-symbol flex items-center gap-2" style="font-weight:700; font-size: calc(13px * var(--font-scale)); margin-bottom:4px">
                          {{ pos.symbol }} 
                          <span style="font-size: calc(10px * var(--font-scale)); color: #8B98A9;" :class="pos.side === 'BUY' ? 'text-[#059669]' : 'text-[#B22234]'">{{ pos.side }}</span>
                      </div>
                      <div class="pnl-detail-text" style="font-size: calc(10px * var(--font-scale)); color:#6B7280; display:flex; gap:12px; flex-wrap:wrap">
                        <span>Qty: <span style="font-weight:600">{{ pos.net_quantity }}</span></span>
                        <span>Avg: <span style="font-weight:600">{{ formatPrice(pos.average_price) }}</span></span>
                        <span>LTP: <span style="font-weight:600">{{ formatPrice(getLive(pos).ltp) }}</span></span>
                      </div>
                    </div>
                    <div class="pnl-right-value" style="text-align:right">
                      <div class="individual-pnl-amount" :class="getPnlClass(getDisplayedPnl(pos))" style="font-size: calc(1rem * var(--font-scale)); font-weight:700">
                          <span v-if="getDisplayedPnl(pos) >= 0">+</span>{{ formatUSD(getDisplayedPnl(pos)) }}
                      </div>
                      <div class="order-type-badge-sm" :class="pos.side === 'BUY' ? 'long' : 'short'" style="font-size: calc(0.65rem * var(--font-scale)); font-weight:600; padding:2px 6px; border-radius:30px; display:inline-block; margin-top:4px;">
                          Active
                      </div>
                    </div>
                 </div>
             </div>
          </div>
       </div>

    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !loading" class="flex text-[calc(13px*var(--font-scale))] font-semibold justify-center items-center py-2 space-x-4 text-gray-500">
        <button @click="goToPreviousPage" :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-30">
            <i class="fas fa-chevron-left"></i>
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="goToNextPage" :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-30">
            <i class="fas fa-chevron-right"></i>
        </button>
    </div>

    <ConfirmationModal v-model="showConfirmationModal" title="Exit All Positions"
        message="Are you sure want to square off all positions." confirm-text="Exit" cancel-text="Cancel"
        @confirm="sqoffAll" @cancel="showConfirmationModal = false" />
    <PositionExitModal />

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePositionStore } from '@/stores/position'
import { useTickerStore } from '@/stores/ticker'
import { calculatePnl, formatNumber } from '@/utils/pnl'
import { symbolSegment } from '@/utils/symbolsegment'
import { useWalletStore } from '@/stores/wallet'
import PositionExitModal from './PositionExitModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import LoaderComponent from '@/components/LoaderComponent.vue'
import AppHeader from '@/components/AppHeader.vue'

/* ---------- STORES ---------- */
const positionStore = usePositionStore()
const tickerStore = useTickerStore()
const walletStore = useWalletStore()

const { positions, openPositions, currentPage, totalPages, showPositionModal, loading, selectedPosition, params } =
    storeToRefs(positionStore)

/* ---------- UI STATE ---------- */
const showConfirmationModal = ref(false);

const currentMain = ref('cumulative'); // 'cumulative' | 'detailed'
const activePositionTab = ref(params.value.status || 'OPEN'); // 'OPEN' | 'CLOSED' | 'ACTIVE'

const setMain = (mainMode) => {
    currentMain.value = mainMode;
    if (mainMode === 'cumulative') {
        activePositionTab.value = 'OPEN';
    } else {
        activePositionTab.value = 'ACTIVE';
    }
}

// Map the UI state right into the API queries
watch(activePositionTab, tab => {
    positionStore.params.status = tab;
    positionStore.params.page = 1;
    positionStore.getPositions();
})

/* ---------- PAGINATION ---------- */
const goToNextPage = () => {
    positionStore.params.page++
    positionStore.getPositions()
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const goToPreviousPage = () => {
    positionStore.params.page--
    positionStore.getPositions()
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- 🔑 SAME LTP LOGIC ---------- */
const getTickerKey = pos =>
    symbolSegment.includes(pos.segment)
        ? pos.symbol
        : pos.instrument_token

const getLive = pos => {
    const tick = tickerStore.getLastPrice(getTickerKey(pos)) || {}
    return {
        ltp: tick.ltp ?? 0,
        bid: tick.bid ?? 0,
        ask: tick.ask ?? 0
    }
}

/* ---------- PNL ---------- */
const getDisplayedPnl = pos => {
    if (activePositionTab.value === 'CLOSED') {
        return Number(pos.realized_pnl || 0)
    }
    return calculatePnl(pos, tickerStore)
}

const getPnlClass = pnl => {
    if (Number(pnl) > 0) return 'text-[#059669]'
    if (Number(pnl) < 0) return 'text-[#B22234]'
    return 'text-gray-500'
}

const formatPnl = pnl => Number(pnl || 0).toFixed(2)

const formatUSD = (val) => {
    return '₹' + formatNumber(val);
}
const formatPrice = (val) => {
    return formatNumber(val);
}

/* ---------- EXIT DATA ---------- */
const getExitPrice = pos =>
    pos.side === 'BUY'
        ? Number(pos.sell_price || 0)
        : Number(pos.buy_price || 0)

const formatDate = v =>
    v ? new Date(v).toLocaleString() : '-'

/* ---------- SQOFF ---------- */
const openExitModal = (position) => {
    if (activePositionTab.value === 'CLOSED') return;
    selectedPosition.value = position;
    showPositionModal.value = true;
}

const sqoffAll = async () => {
    await positionStore.sqoffAllPosition()
    walletStore.getWallet()
    positionStore.getPositions()
    positionStore.getOpenPositions()
    showConfirmationModal.value = false;
}

/* ---------- COMPUTEDS ---------- */
const totalPnl = computed(() => {
    let sum = 0;
    positionStore.openPositions.forEach(pos => {
        sum += Number(calculatePnl(pos, tickerStore) || 0)
    })
    return sum;
})

const realizedPnl = computed(() => {
    // Only calculate from CURRENT view if it's CLOSED, else assume 0 or fallback
    if (activePositionTab.value === 'CLOSED') {
        let sum = 0;
        positions.value.forEach(pos => {
            sum += Number(pos.realized_pnl || 0) - Number(pos.brokerage || 0);
        })
        return sum;
    }
    return 0; // Not fully tracked globally in memory without API call
})

</script>

<style scoped>
/* Page Styles Transplanted from Template */
* {
  box-sizing: border-box;
}

.positions-app {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Inter', sans-serif;
  padding-bottom: 20px;
}


/* Exit All Button */
.exit-all-btn {
  background: #B22234;
  border: none;
  border-radius: 40px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(178, 34, 52, 0.2);
}

.exit-all-btn i {
  color: white;
  font-size: calc(12px * var(--font-scale));
}

.exit-all-btn span {
  color: white;
  font-size: calc(12px * var(--font-scale));
  font-weight: 600;
}

.exit-all-btn:active {
  transform: scale(0.96);
  background: #8B1A2A;
}

.exit-all-btn.disabled {
  background: #D1D5DB;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.exit-all-btn.disabled:active {
  transform: none;
}

/* Main Navigation Tabs */
.main-nav {
  display: flex;
  margin: 12px 16px 0 16px;
  background: #FFFFFF;
  border-radius: 44px;
  padding: 4px;
  flex-shrink: 0;
}

.main-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: calc(13px * var(--font-scale));
  font-weight: 600;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  background: transparent;
}

.main-tab.active {
  background: #FFFFFF;
  color: #B22234;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 16px 16px 20px 16px;
}

/* P&L Summary Card */
.pnl-summary-card {
  background: linear-gradient(135deg, #F8FAFE 0%, #FFFFFF 100%);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #EDF2F7;
}

.summary-header {
  text-align: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #EEF2F8;
}

.summary-header span {
  font-size: calc(11px * var(--font-scale));
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-left {
  text-align: left;
  flex: 1;
}

.summary-center {
  text-align: center;
  flex: 1.2;
}

.summary-right {
  text-align: right;
  flex: 1;
}

.summary-label {
  font-size: calc(9px * var(--font-scale));
  font-weight: 600;
  color: #8B98A9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.summary-value {
  font-size: calc(14px * var(--font-scale));
  font-weight: 700;
}

.summary-value.positive {
  color: #059669;
}

.summary-value.negative {
  color: #B22234;
}

.center-value {
  font-size: calc(22px * var(--font-scale));
  font-weight: 800;
}

/* Sub Navigation for Open/Closed Positions */
.sub-nav {
  display: flex;
  margin: 0 0 16px 0;
  background: #F8FAFE;
  border-radius: 40px;
  padding: 3px;
}

.sub-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: calc(12px * var(--font-scale));
  font-weight: 600;
  border-radius: 36px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  background: transparent;
}

.sub-tab.active {
  background: #FFFFFF;
  color: #B22234;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Compact Position Card */
.compact-position-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border: 1px solid #E8EDF2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
  cursor: pointer;
}

.compact-position-card:active {
  background: #F8FAFF;
}

.pos-left {
  flex: 1;
}

.pos-symbol {
    font-weight: 700;
    font-size: calc(0.72rem * var(--font-scale));
    color: #111827;
    margin-bottom: 4px;
  }

.pos-details {
    display: flex;
    gap: 16px;
    font-size: calc(0.7rem * var(--font-scale));
    color: #6B7280;
  }

.pos-details span {
  font-weight: 500;
}

.pos-details .value {
  font-weight: 700;
  color: #1F2937;
}

.pos-right {
  text-align: right;
}

.order-type-badge {
    font-size: calc(0.65rem * var(--font-scale));
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 8px;
  }

.order-type-badge.long {
  background: #E9F6EF;
  color: #059669;
}

.order-type-badge.short {
  background: #FEF2F2;
  color: #B22234;
}

.pnl-right-value {
    font-size: calc(1rem * var(--font-scale));
    font-weight: 700;
    margin-bottom: 5px;
  }

.pnl-right-value.positive {
  color: #059669;
}

.pnl-right-value.negative {
  color: #B22234;
}

.ltp-value {
    font-size: calc(0.7rem * var(--font-scale));
    font-weight: 500;
    color: #6B7280;
  }

.ltp-value span {
  font-weight: 700;
  color: #1F2937;
}

/* Detailed P&L Page Styles */
.detailed-page {
  padding: 0;
}

.individual-positions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title-small {
  font-size: calc(12px * var(--font-scale));
  font-weight: 700;
  color: #374151;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #EEF2F8;
  text-transform: uppercase;
}

.individual-pnl-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #EDF2F7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.individual-pnl-card:active {
  background: #f8fafc;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
  font-size: calc(13px * var(--font-scale));
  background: #FAFCFE;
  border-radius: 20px;
  margin-top: 8px;
  font-weight: 500;
}

.order-type-badge-sm {
    background: #F3F4F6;
    color: #4B5563;
}
.order-type-badge-sm.long { background: #E9F6EF; color: #059669; }
.order-type-badge-sm.short { background: #FEF2F2; color: #B22234; }
</style>

<style>
/* Dark Mode Overrides for Positions */
[data-theme="dark"] .positions-app { background: #071824; color: #E8EAED; }
[data-theme="dark"] .exit-all-btn { background: #B22234; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
[data-theme="dark"] .exit-all-btn.disabled { background: #2D3748; }
[data-theme="dark"] .main-nav { background: #0f212e; }
[data-theme="dark"] .main-tab.active { background: #071824; color: #FCA5A5; }
[data-theme="dark"] .pnl-summary-card { background: #0f212e; border-color: #2D3748; }
[data-theme="dark"] .summary-header { border-bottom-color: #2D3748; }
[data-theme="dark"] .summary-header span { color: #9AA4BF; }
[data-theme="dark"] .summary-value { color: #E8EAED; }
[data-theme="dark"] .sub-nav { background: #0f212e; }
[data-theme="dark"] .sub-tab { color: #9AA4BF; }
[data-theme="dark"] .sub-tab.active { background: #071824; color: #FCA5A5; }
[data-theme="dark"] .empty-state { background: #0f212e; color: #9AA4BF; }
[data-theme="dark"] .compact-position-card { background: #0f212e; border-color: #2D3748; }
[data-theme="dark"] .compact-position-card:active { background: #071824; }
[data-theme="dark"] .pos-symbol { color: #E8EAED; }
[data-theme="dark"] .pos-symbol span { background: #071824; color: #9AA4BF; }
[data-theme="dark"] .pos-details .value { color: #E8EAED; }
[data-theme="dark"] .order-type-badge.long { background: #122921; color: #34D399; }
[data-theme="dark"] .order-type-badge.short { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .ltp-value span { color: #E8EAED; }
[data-theme="dark"] .individual-pnl-card { background: #0f212e; border-color: #2D3748; }
[data-theme="dark"] .individual-pnl-card:active { background: #071824; }
[data-theme="dark"] .order-type-badge-sm { background: #071824; color: #9AA4BF;}
[data-theme="dark"] .order-type-badge-sm.long { background: #122921; color: #34D399; }
[data-theme="dark"] .order-type-badge-sm.short { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .section-title-small { color: #9AA4BF; border-bottom-color: #2D3748; }
</style>
