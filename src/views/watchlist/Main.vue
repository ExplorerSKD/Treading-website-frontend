<template>
  <div class="mobile-app">
    <!-- Header -->
    <div class="app-header">
      <div class="header-top">
        <div class="logo-area">
          <div class="logo-text">Watchlist</div>
        </div>
        <div class="nav-right">
          <div class="wallet-pill" @click="handleWalletClick">
            <i class="fas fa-wallet"></i><span class="hidden sm:inline ml-1">Wallet</span>
          </div>
          <div class="nav-icon theme-toggle-icon" @click="toggleTheme">
            <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </div>
          <div class="nav-icon" @click="showNotificationModal = true">
            <i class="fas fa-bell"></i>
          </div>
        </div>
      </div>

      <!-- Segments Tab Navigation -->
      <div class="segments-container" v-if="filteredSegments.length">
        <div class="segments-scroll">
          <div 
            v-for="segment in filteredSegments" 
            :key="segment" 
            class="segment-tab" 
            :class="{ active: activeSegment === segment }"
            @click="selectWatchlist(segment)"
          >
            {{ segment }}
          </div>
        </div>
      </div>
      
      <!-- Search -->
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQueryInput"
          placeholder="Search stocks, futures, crypto from library..." 
          autocomplete="off"
        >
        <i 
          class="fas fa-times-circle clear-search" 
          :class="{ 'visible': searchQueryInput.length > 0 }"
          @click="clearSearch"
        ></i>
      </div>
    </div>

    <div class="main-content">
      <!-- Search Results Area -->
      <div v-show="searchQueryInput" class="search-results-frame">
        <div class="search-results-header">
            <span class="search-results-title"><i class="fas fa-search"></i> SEARCH RESULTS</span>
            <span class="search-results-count">{{ searchedInstruments.length }} RESULTS</span>
        </div>
        
        <div v-if="loading" class="search-results-body">
            <div class="search-loader-wrap">
                <LoaderComponent :show="true" />
            </div>
        </div>
        <div v-else-if="searchedInstruments.length === 0" class="search-results-body">
            <div class="no-results">
                <i class="fas fa-search"></i> No matching scripts found
            </div>
        </div>
        
        <div v-else class="search-results-body">
          <div class="search-result-scroll">
            <div 
               v-for="inst in searchedInstruments" 
               :key="inst.id" 
               class="search-result-item"
            >
              <div class="search-result-info">
                <div class="search-result-name">{{ inst.tradingsymbol }}</div>
                <div class="search-result-meta">{{ inst.name }} • {{ inst.segment }} - {{ inst.instrument_type || 'N/A' }}</div>
              </div>
              
              <div class="search-result-right">
                <span class="search-result-price">{{ inst.last_price || '' }}</span>
                <button 
                   v-if="!isAlreadyAdded(inst)" 
                   class="add-pill-btn"
                   @click="addScript(inst)"
                >
                  Add
                </button>
                <button 
                   v-else 
                   disabled
                   class="add-pill-btn added"
                >
                  <i class="fas fa-check"></i> Added
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MY WATCHLIST Section (always visible) -->
      <div class="watchlist-section">
        
        <!-- Watchlist Header -->
        <div class="watchlist-header-bar">
          <div class="watchlist-header-left">
            <i class="fas fa-chart-line wl-icon"></i>
            <span class="wl-title">MY WATCHLIST</span>
            <span class="wl-count">{{ selectedWatchlist?.symbols?.length || 0 }} items</span>
          </div>
        </div>



        <!-- Multi-select Menu Bar -->
        <div id="multiSelectBar" v-show="isDeleteMode">
          <div class="multi-select-bar">
            <div class="multi-select-row top-row">
              <div class="select-actions">
                  <button class="select-all-btn" @click="selectAllItems">
                      <i class="fas fa-check-double"></i> Select All
                  </button>
                  <button class="select-all-btn" @click="unselectAllItems" v-show="selectedItems.length > 0">
                      <i class="fas fa-minus-square"></i> Unselect All
                  </button>
              </div>
              <span class="selected-count">{{ selectedItems.length }} selected</span>
            </div>
            <div class="multi-select-row bottom-row">
              <div class="delete-actions">
                  <button class="exit-selection-btn" @click="toggleDeleteMode">
                      <i class="fas fa-times"></i> Cancel
                  </button>
                  <button 
                      class="delete-selected-btn" 
                      :class="{ 'disabled': selectedItems.length === 0 }"
                      @click="deleteSelected"
                  >
                      <i class="fas fa-trash-alt"></i> Delete
                  </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Watchlist Container -->
        <div class="watchlist-cards-container">
          <div v-if="loadingWatchlist && !selectedWatchlist">
             <LoaderComponent :show="true" />
          </div>
          <div v-else-if="!selectedWatchlist?.symbols?.length" class="empty-watchlist">
            <i class="fas fa-plus-circle text-2xl mb-2"></i>
            <p style="font-weight:600;">Your watchlist is empty</p>
            <p style="font-size:12px; margin-top:8px;">
                🔍 Search above or tap <strong>Scripts Library</strong> ➕ to add instruments
            </p>
          </div>
          
          <div v-else class="watchlist-card-list">
             <!-- Render Items -->
             <div 
               v-for="(item, index) in selectedWatchlist?.symbols" 
               :key="item.token || item.symbol"
               class="swipe-container"
               :class="{ 'swiping': swipeStates[getItemId(item)]?.swiping }"
             >
                <!-- Swipe Background -->
                <div class="delete-background">
                    <i class="fas fa-trash-alt"></i> Delete
                </div>
                
                <!-- The Actual Card -->
                <div 
                   class="instrument-card"
                   :class="{ 'selected-mode': selectedItems.includes(getItemId(item)) }"
                   :style="getSwipeStyle(getItemId(item))"
                   @touchstart="(e) => handleStart(e, getItemId(item))"
                   @touchmove="(e) => handleMove(e, getItemId(item))"
                   @touchend="(e) => handleEnd(e, getItemId(item))"
                   @mousedown="(e) => handleStart(e, getItemId(item))"
                   @mousemove="(e) => handleMove(e, getItemId(item))"
                   @mouseup="(e) => handleEnd(e, getItemId(item))"
                   @mouseleave="(e) => handleEnd(e, getItemId(item))"
                   @click="onCardClick(item)"
                >
                    <!-- Checkbox (Shown in Delete Mode) -->
                    <div class="checkbox-wrapper" :style="{ display: isDeleteMode ? 'block' : 'none' }">
                        <div 
                            class="custom-checkbox" 
                            :class="{ 'selected': selectedItems.includes(getItemId(item)) }"
                            @click.stop="toggleItemSelection(item)"
                        >
                            <i v-if="selectedItems.includes(getItemId(item))" class="fas fa-check"></i>
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="instrument-info flex-1">
                        <div class="instrument-symbol">
                           <span class="symbol-text">{{ item.symbol }}</span>
                           <span v-if="!symbolSegment.includes(item.segment)" class="exchange-badge">
                              {{ item.exchange }}
                           </span>
                        </div>
                        <div class="instrument-name">
                           <span v-if="!symbolSegment.includes(item.segment)">{{ formatSubtitle(item) }}</span>
                           <span v-else>{{ item.segment }}</span>
                        </div>
                    </div>

                    <!-- Price Module -->
                    <div class="instrument-price-area">
                        <!-- We fetch from tickerStore dynamically -->
                        <div class="price-value" :class="getLTPColor(item)">
                           {{ formatNumber(tickerStore.getLastPrice(getTickerKey(item))?.ltp) }}
                        </div>
                        <div 
                           class="change-badge"
                           :class="(tickerStore.getLastPrice(getTickerKey(item))?.change >= 0) ? 'positive' : 'negative'"
                        >
                           {{ tickerStore.getLastPrice(getTickerKey(item))?.change >= 0 ? '+' : '' }}{{ tickerStore.getLastPrice(getTickerKey(item))?.change?.toFixed(2) ?? '0.00' }} 
                           ({{ symbolSegment.includes(item.segment) ? tickerStore.getLastPrice(getTickerKey(item))?.changepercent : computeChangePercent(tickerStore.getLastPrice(getTickerKey(item))).toFixed(2) }}%)
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <place-order-modal />
    <NotificationModal />

    <!-- Trade Sheet Bottom Modal -->
    <div class="trade-sheet-overlay" :class="{ 'active': showTradeSheet }" @click="closeTradeSheet"></div>
    <div class="trade-sheet" :class="{ 'open': showTradeSheet }" 
         @touchstart="onSheetTouchStart" 
         @touchmove="onSheetTouchMove">
        
        <div class="sheet-handle"><div class="handle-bar"></div></div>
        
        <div class="sheet-header" v-if="currentTradeScript">
            <div class="sheet-header-row">
                <div>
                    <div class="sheet-script-name">{{ currentTradeScript.symbol }}</div>
                    <div><span class="sheet-segment">{{ currentTradeScript.segment }}</span></div>
                </div>
                <div class="sheet-cmp-area">
                    <div class="sheet-cmp-label">CMP</div>
                    <div class="sheet-cmp-value" :class="getLTPColor(currentTradeScript)">
                        {{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.ltp) }}
                    </div>
                    <div>
                      <span class="sheet-change" :class="(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.change >= 0) ? 'positive' : 'negative'">
                          {{ tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.change >= 0 ? '+' : '' }}{{ tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.change?.toFixed(2) ?? '0.00' }} 
                          ({{ symbolSegment.includes(currentTradeScript.segment) ? tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.changepercent : computeChangePercent(tickerStore.getLastPrice(getTickerKey(currentTradeScript))).toFixed(2) }}%)
                      </span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bid/Ask -->
        <div class="sheet-bidask" v-if="currentTradeScript">
            <div class="sheet-bid">
                <div class="sheet-bidask-label">BID</div>
                <div class="sheet-bid-value">
                   {{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.bid) || '-' }}
                </div>
            </div>
            <div class="sheet-divider"></div>
            <div class="sheet-ask">
                <div class="sheet-bidask-label">ASK</div>
                <div class="sheet-ask-value">
                   {{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.ask) || '-' }}
                </div>
            </div>
        </div>
        
        <!-- OHLC -->
        <div class="sheet-ohlc" v-if="currentTradeScript">
            <div class="sheet-ohlc-title"><i class="fas fa-chart-simple"></i> PRICE SUMMARY</div>
            <div class="ohlc-grid">
                <div class="ohlc-item">
                    <div class="ohlc-label">OPEN</div>
                    <div class="ohlc-value open">{{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.o) }}</div>
                </div>
                <div class="ohlc-item">
                    <div class="ohlc-label">HIGH</div>
                    <div class="ohlc-value high">{{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.h) }}</div>
                </div>
                <div class="ohlc-item">
                    <div class="ohlc-label">LOW</div>
                    <div class="ohlc-value low">{{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.l) }}</div>
                </div>
                <div class="ohlc-item">
                    <div class="ohlc-label">CLOSE</div>
                    <div class="ohlc-value close">{{ formatNumber(tickerStore.getLastPrice(getTickerKey(currentTradeScript))?.c) }}</div>
                </div>
            </div>
        </div>
        
        <!-- Contract -->
        <div class="sheet-contract" v-if="currentTradeScript && !symbolSegment.includes(currentTradeScript.segment)">
            <span class="sheet-contract-label"><i class="fas fa-calendar-alt"></i> CONTRACT DATE</span>
            <span class="sheet-contract-value">{{ formatDateFull(currentTradeScript.expiry_date) }}</span>
        </div>
        
        <!-- Buttons -->
        <div class="sheet-actions">
            <button class="sheet-btn-buy" @click="executeTrade('BUY')"><i class="fas fa-arrow-up"></i> BUY</button>
            <button class="sheet-btn-sell" @click="executeTrade('SELL')"><i class="fas fa-arrow-down"></i> SELL</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTickerStore } from '@/stores/ticker'
import useWatchlistStore from '@/stores/watchlist'
import { storeToRefs } from 'pinia'
import PlaceOrderModal from './PlaceOrderModal.vue'
import { useProfileStore } from '@/stores/profile'
import { symbolSegment } from '@/utils/symbolsegment'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/pnl'
import LoaderComponent from '@/components/LoaderComponent.vue'
import { useToastStore } from "@/stores/utils/toast"

import { useNotificationStore } from '@/stores/notifications'
import { useWalletStore } from '@/stores/wallet'
import NotificationModal from '@/components/NotificationModal.vue'

const watchlistStore = useWatchlistStore()
const tickerStore = useTickerStore()
const profileStore = useProfileStore()
const router = useRouter()
const toastStore = useToastStore()
const notificationStore = useNotificationStore()
const walletStore = useWalletStore()

const { profile } = storeToRefs(profileStore)
const { showNotificationModal } = storeToRefs(notificationStore)
const {
    activeSegment,
    selectedWatchlist,
    watchlists,
    selectedScript,
    showOrderModal,
    loading: loadingWatchlist,
    searchedInstruments
} = storeToRefs(watchlistStore)

/* ---------------- UI STATE ---------------- */
const showTradeSheet = ref(false)
const currentTradeScript = ref(null)
const isDark = ref(localStorage.getItem('app-theme') === 'dark')

const applyTheme = (dark) => {
    document.body.classList.toggle('dark', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('marginApexTheme', dark ? 'dark' : 'light')
    localStorage.setItem('app-theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    toastStore.addToast("Theme", isDark.value ? "Dark Mode Enabled" : "Light Mode Enabled", "info", 2000)
}

const handleWalletClick = () => {
    router.push({ name: 'wallet' })
}

/* ---------------- SEARCH FUNCTIONALITY ---------------- */
const searchQueryInput = ref('')
let debounceTimer = null
const loading = ref(false)

watch(searchQueryInput, (val) => {
  if (!val) {
     watchlistStore.searchedInstruments = []
     return
  }
  loading.value = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await watchlistStore.searchTokens(val)
    loading.value = false
  }, 400)
})

const clearSearch = () => {
    searchQueryInput.value = ''
    watchlistStore.searchedInstruments = []
}

const isAlreadyAdded = (tradingSymbol) => {
  const watchlist = watchlists.value.find(w => w.name == activeSegment.value)
  if (!watchlist) return false
  return watchlist.symbols.some(s => s.token == tradingSymbol?.instrument_token)
}

const addScript = async (item) => {
  const payload = {
    script: item.name,
    instrument_type: item.instrument_type,
    symbol: item.tradingsymbol,
    token: String(item.instrument_token),
    segment: activeSegment.value,
    exchange: item.exchange,
    expiry_date: item.expiry || "",
    lot_size: item.lot_size,
    strike: item.strike
  }
  await watchlistStore.addSymbolToWatchlist(payload, { successMessage: `${item.tradingsymbol} added to watchlist` })
}

/* ---------------- DELETE FUNCTIONALITY (HOLD TO INTERACT) ---------------- */
const isDeleteMode = ref(false)
const selectedItems = ref([])

watch(isDeleteMode, (val) => {
    if (val) {
        toastStore.addToast("Selection", "Selection mode active - tap items to select", "success", 3000)
    }
})

const toggleDeleteMode = () => {
    isDeleteMode.value = !isDeleteMode.value
    if (!isDeleteMode.value) {
        selectedItems.value = []
    }
}

const getItemId = (item) => {
    return item.symbol
}

const toggleItemSelection = (item) => {
    const id = getItemId(item)
    const index = selectedItems.value.indexOf(id)

    if (index > -1) {
        selectedItems.value.splice(index, 1)
    } else {
        selectedItems.value.push(id)
    }
    
    // Auto-exit if empty
    if(selectedItems.value.length === 0) {
        isDeleteMode.value = false;
    }
}

const isAllSelected = computed(() => {
    if (!selectedWatchlist.value?.symbols?.length) return false
    return selectedItems.value.length === selectedWatchlist.value.symbols.length
})

const selectAllItems = () => {
    selectedItems.value = selectedWatchlist.value.symbols.map(item => getItemId(item))
}

const unselectAllItems = () => {
    selectedItems.value = []
}

const deleteSelected = async () => {
    if (selectedItems.value.length === 0) return

    const count = selectedItems.value.length;
    await watchlistStore.deleteScripts(selectedItems.value, { 
        successMessage: `${count} script${count > 1 ? 's' : ''} removed from watchlist` 
    })

    selectedItems.value = []
    isDeleteMode.value = false
}

/* ---------------- SWIPE TO DELETE ---------------- */
const swipeStates = ref({})
let longPressTimer = null;

const handleStart = (e, id) => {
    if (isDeleteMode.value) return;
    
    // Set up long press
    longPressTimer = setTimeout(() => {
        isDeleteMode.value = true;
        selectedItems.value.push(id);
        navigator.vibrate && navigator.vibrate(50);
    }, 500);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    swipeStates.value[id] = { startX: clientX, startY: clientY, currentX: 0, swiping: true }
}

const handleMove = (e, id) => {
    const deltaX = (e.touches ? e.touches[0].clientX : e.clientX) - swipeStates.value[id].startX;
    const deltaY = (e.touches ? e.touches[0].clientY : e.clientY) - (swipeStates.value[id].startY || 0);

    // Cancel long press if user moves more than 10px
    if (longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (!swipeStates.value[id]?.swiping || isDeleteMode.value) return;
    
    let offset = Math.min(Math.max(deltaX, -80), 0)
    
    if (offset < -70) {
        offset = offset * 0.8 - 14
    }
    
    swipeStates.value[id].currentX = offset
}

const handleEnd = async (e, id) => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (!swipeStates.value[id]?.swiping || isDeleteMode.value) return;
    
    swipeStates.value[id].swiping = false;
    
    if (swipeStates.value[id].currentX < -45) {
        // Trigger delete only on left swipe
        await watchlistStore.deleteScripts([id], { successMessage: `${id} removed from watchlist` })
    }
    
    if (swipeStates.value[id]) {
       swipeStates.value[id].currentX = 0
    }
}

const getSwipeStyle = (id) => {
    const s = swipeStates.value[id];
    if (!s) return '';
    return `transform: translateX(${s.currentX}px); transition: ${s.swiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)'}`
}

/* ---------------- TRADE & BOTTOM SHEET ---------------- */
const onCardClick = (item) => {
    if (isDeleteMode.value) {
        toggleItemSelection(item)
        return
    }
    
    // Cancel any accidental swipe processing
    const id = getItemId(item);
    if(swipeStates.value[id] && Math.abs(swipeStates.value[id].currentX) > 5) {
       return;
    }

    currentTradeScript.value = item;
    showTradeSheet.value = true;
}

const closeTradeSheet = () => {
    showTradeSheet.value = false;
    setTimeout(() => {
        currentTradeScript.value = null;
    }, 300);
}

// Swipe down on trade sheet to close
let sheetStartY = 0;
const onSheetTouchStart = (e) => {
    sheetStartY = e.touches[0].clientY;
}
const onSheetTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - sheetStartY;
    if (deltaY > 60) closeTradeSheet();
}

const executeTrade = (type) => {
    // We launch PlaceOrderModal by setting selectedScript and opening it
    selectedScript.value = currentTradeScript.value;
    watchlistStore.selectedSide = type;
    showOrderModal.value = true;
    // Hide trade sheet but keep currentTradeScript so we can reopen it
    showTradeSheet.value = false;
}

// When the order modal closes, reopen the trade sheet (back button) or go to watchlist (order placed)
watch(showOrderModal, (isOpen) => {
    if (!isOpen) {
        if (watchlistStore.orderPlaced) {
            // Order was placed successfully - close everything, go to watchlist
            watchlistStore.orderPlaced = false;
            showTradeSheet.value = false;
            currentTradeScript.value = null;
        } else if (currentTradeScript.value) {
            // Back button pressed - reopen trade sheet
            showTradeSheet.value = true;
        }
    }
})

/* ---------------- WATCHLIST SEGMENTS ---------------- */
const selectWatchlist = (segment) => {
    activeSegment.value = segment
    selectedWatchlist.value = watchlists.value.find(w => w.name === segment) || null
    isDeleteMode.value = false
    selectedItems.value = []
}

const segments = [
    'INDEX-FUT', 'INDEX-OPT', 'STOCK-FUT', 'STOCK-OPT',
    'MCX-FUT', 'MCX-OPT', 'NSE-EQ',
    'CRYPTO', 'FOREX', 'COMEX'
]

const filteredSegments = computed(() => {
    const allowed = profile.value?.settings?.exchange_segments || []
    return segments.filter(segment => allowed.includes(segment))
})

/* ---------------- HELPERS ---------------- */
const formatSubtitle = (item) => {
    const parts = []
    if (item.strike && item.instrument_type === 'OPT') parts.push(`${item.strike} CE`)
    if (item.expiry_date) parts.push(formatDate(item.expiry_date))
    return parts.join(' • ')
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
    })
}

const formatDateFull = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const getTickerKey = (item) => {
    return symbolSegment.includes(item.segment) ? item.symbol : item.token
}

function computeChangePercent(tick) {
    if (!tick || !tick.c) return 0
    return ((tick.ltp - tick.c) / tick.c) * 100
}

const getLTPColor = (item) => {
    const tick = tickerStore.getLastPrice(getTickerKey(item))
    if(!tick) return '';
    return tick.change >= 0 ? 'text-custom-green' : 'text-custom-red'
}

onMounted(() => {
    // Initialize watchlist if needed mapping it safely
    if(!activeSegment.value && filteredSegments.value.length) {
        selectWatchlist(filteredSegments.value[0])
    }
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

* {
    -webkit-tap-highlight-color: transparent;
}

/* Global Mobile Frame emulation using viewport sizes internally */
.mobile-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
    background: #FFFFFF;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow-x: hidden;
}

/* Header - White background */
.app-header {
    background: #FFFFFF;
    padding: 14px 16px;
    border-bottom: 1px solid #E8ECF0;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 50;
}

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4B5563;
    cursor: pointer;
    border: 1px solid transparent;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

:global(body.dark) .nav-icon {
    background: #1A1F2D !important;
    color: #E8EAED !important;
}

.wallet-pill {
    background: #065F46;
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(6, 95, 70, 0.2);
}

:global(body.dark) .wallet-pill {
    background: #10B981;
    color: #111827;
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-text {
    font-weight: 700;
    font-size: 1.2rem;
    color: #1A1E2B;
}

/* Segments Tabs */
.segments-container {
    margin-bottom: 12px;
    margin-top: 4px;
}

.segments-scroll {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    padding: 0;
}

.segments-scroll::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.segment-tab {
    padding: 10px 16px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6B7280;
    white-space: nowrap;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    text-transform: uppercase;
}

.segment-tab:first-child {
    padding-left: 0;
}

.segment-tab.active {
    color: #1A1E2B;
}

.segment-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 2px;
    background: #1A1E2B;
    border-radius: 2px;
}

.segment-tab:first-child.active::after {
    left: 0;
    right: 16px;
}

.folder-btn {
    background: #F8F9FC;
    border: 1px solid #E2E6EC;
    border-radius: 40px;
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 600;
    color: var(--custom-primary);
    font-size: 0.75rem;
    white-space: nowrap;
}

.folder-btn:active {
    background: #EDEFF3;
    transform: scale(0.96);
}

/* Search Bar */
.search-wrapper {
    position: relative;
    width: 100%;
    margin-top: 4px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9AA4BF;
    font-size: 0.9rem;
}

.search-input {
    width: 100%;
    padding: 12px 40px 12px 42px;
    background: #F8F9FC;
    border: 1px solid #E8ECF0;
    border-radius: 30px;
    font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
}

.search-input:focus {
    outline: none;
    border-color: var(--custom-primary);
    background: #FFFFFF;
}

.clear-search {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9AA4BF;
    cursor: pointer;
    font-size: 0.8rem;
    display: none;
}

.clear-search.visible {
    display: block;
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 16px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
}

/* Search Results Frame */
.search-results-frame {
    margin-bottom: 16px;
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
    border: 1px solid #EEF2F8;
    flex-shrink: 0;
    overflow: hidden;
}

.search-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #F0F2F8;
}

.search-results-title {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--custom-primary);
    display: flex;
    align-items: center;
    gap: 6px;
}

.search-results-count {
    font-size: 0.6rem;
    font-weight: 700;
    color: #3B82F6;
    text-transform: uppercase;
}

.search-results-body {
    padding: 0;
}

.search-loader-wrap {
    padding: 24px;
    display: flex;
    justify-content: center;
}

.search-result-scroll {
    max-height: 320px;
    overflow-y: auto;
    padding: 6px 0;
}

.search-result-scroll::-webkit-scrollbar {
    width: 4px;
}

.search-result-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.search-result-scroll::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 4px;
}

.search-result-item {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #F5F6FA;
    transition: background 0.15s;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover {
    background: #FAFBFD;
}

.search-result-info {
    flex: 1;
    min-width: 0;
}

.search-result-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #1A1E2B;
    margin-bottom: 2px;
}

.search-result-meta {
    font-size: 0.65rem;
    color: #8F9BB3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-result-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.search-result-price {
    font-weight: 700;
    font-size: 0.9rem;
    color: #1A1E2B;
}

.add-pill-btn {
    background: #C62E2E;
    color: white;
    border: none;
    padding: 6px 18px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.add-pill-btn:active {
    transform: scale(0.93);
    background: #A82222;
}

.add-pill-btn.added {
    background: #E9F6EF;
    color: #2C8E5A;
    cursor: default;
    display: flex;
    align-items: center;
    gap: 4px;
}

.no-results {
    text-align: center;
    padding: 24px;
    color: #AEB5CC;
    font-size: 0.8rem;
}

/* Watchlist Section */
.watchlist-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.watchlist-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 4px 10px;
    flex-wrap: wrap;
    gap: 6px;
}

.watchlist-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.wl-icon {
    font-size: 0.85rem;
    color: #6B7280;
}

.wl-title {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #1A1E2B;
    letter-spacing: 0.5px;
}

.wl-count {
    font-size: 0.65rem;
    font-weight: 600;
    color: #6B7280;
    background: #F0F2F5;
    padding: 3px 10px;
    border-radius: 30px;
}

.watchlist-header-right {
    display: flex;
    align-items: center;
}

.action-hint {
    font-size: 0.55rem;
    color: #9AA4BF;
    white-space: nowrap;
}



/* Multi-Select Bar */
.multi-select-bar {
    background: #F8F9FC;
    border-radius: 20px;
    margin-bottom: 12px;
    overflow: hidden;
    border: 1px solid #E8ECF0;
    flex-shrink: 0;
}

.multi-select-row {
    padding: 8px 16px;
}

.multi-select-row.top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E8ECF0;
    background: #FFFFFF;
}

.multi-select-row.bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #F8F9FC;
}

.select-actions {
    display: flex;
    gap: 8px;
}

.delete-actions {
    display: flex;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
}

.select-all-btn, .unselect-all-btn {
    background: none;
    border: none;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}

.select-all-btn {
    background: #F0F2F5;
    color: #4A5568;
}

.delete-selected-btn {
    background: #C62E2E;
    border: none;
    padding: 6px 16px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: white;
}

.exit-selection-btn {
    background: #F0F2F5;
    border: none;
    padding: 6px 16px;
    border-radius: 30px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #5B677E;
}

.delete-selected-btn.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.selected-count {
    font-size: 0.75rem;
    color: var(--custom-primary);
    font-weight: 700;
    background: #FFF0F0;
    padding: 4px 10px;
    border-radius: 30px;
}

/* Watchlist Cards */
.watchlist-cards-container {
    flex: 1;
    min-height: 0;
}

.watchlist-card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.swipe-container {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    touch-action: pan-y;
}

.instrument-card {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 14px 16px;
    border: 1px solid #EEF2F8;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    position: relative;
    z-index: 2;
    cursor: pointer;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
    user-select: none; /* Desktop-e mouse drag prevent korbe */
}

.instrument-card.selected-mode {
    background: #FFF5F5;
    border-color: #C62E2E;
}

.swipe-container.swiping .instrument-card {
    transition: none !important;
}

.delete-background {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    background: #C62E2E;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    color: white;
    font-weight: 600;
    font-size: 0.8rem;
    gap: 6px;
    z-index: 1;
}

.checkbox-wrapper {
    flex-shrink: 0;
}

.custom-checkbox {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid #D1D5DB;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.custom-checkbox.selected {
    background: #C62E2E;
    border-color: #C62E2E;
}

.custom-checkbox.selected i {
    color: #FFFFFF !important;
    font-size: 11px;
    font-weight: 900;
}

.instrument-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.instrument-symbol {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    font-size: 0.72rem;
    color: #1A1E2B;
    margin-bottom: 4px;
    min-width: 0;
}

.symbol-text {
    white-space: nowrap;
}

.exchange-badge {
    flex-shrink: 0;
    font-size: 0.6rem;
    font-weight: 600;
    background: #F0F2F5;
    color: #6B7280;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}

.instrument-name {
    font-size: 0.7rem;
    color: #8C94A8;
}

.instrument-price-area {
    text-align: right;
    min-width: 80px;
    flex-shrink: 0;
}

.price-value {
    font-weight: 700;
    font-size: 1rem;
}

.change-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 30px;
    margin-top: 4px;
    display: inline-block;
}

.positive {
    color: #2C8E5A;
    background: #E9F6EF;
}

.negative {
    color: #C62E2E;
    background: #FEF0F0;
}

.empty-watchlist {
    text-align: center;
    padding: 60px 24px;
    background: #FFFFFF;
    border-radius: 32px;
    border: 1px dashed #DCE3EC;
    color: #9CA3B9;
    margin-top: 20px;
}

/* Folder Drawer */
.folder-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 360px;
    height: 100%;
    background: #FFFFFF;
    z-index: 1000;
    box-shadow: -4px 0 20px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #E8ECF0;
}

.folder-drawer.open {
    transform: translateX(0);
}

.drawer-header {
    padding: 20px 18px;
    border-bottom: 1px solid #F0F3F9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drawer-header h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--custom-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.close-drawer {
    background: #F3F5F9;
    border: none;
    width: 34px;
    height: 34px;
    border-radius: 30px;
    font-size: 1.1rem;
    cursor: pointer;
    color: #5B677E;
}

.folder-tree-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 8px 20px 12px;
}

.tree-node-ul {
    list-style: none;
    padding-left: 0;
}

.tree-item-li {
    margin: 4px 0;
    list-style: none;
    cursor: pointer;
}

.tree-label-row {
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #2C313F;
}
.tree-item-li:hover .tree-label-row {
    background: #F8F9FC;
}

.drawer-footer {
    padding: 14px 20px;
    border-top: 1px solid #EDF2F7;
    font-size: 0.75rem;
    color: #AEB5CC;
}

.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: 0.2s;
}

.drawer-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* COMPACT PROFESSIONAL BOTTOM SHEET */
.trade-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 24px 24px 0 0;
    z-index: 2000;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    overflow: hidden;
    touch-action: pan-y;
}

.trade-sheet.open {
    transform: translateY(0);
}

.trade-sheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1999;
    opacity: 0;
    visibility: hidden;
    transition: 0.2s ease;
}

.trade-sheet-overlay.active {
    opacity: 1;
    visibility: visible;
}

.sheet-handle {
    display: flex;
    justify-content: center;
    padding: 10px 0 6px;
}
.handle-bar {
    width: 40px;
    height: 4px;
    background: #E0E4EA;
    border-radius: 4px;
}

.sheet-header {
    padding: 4px 16px 10px;
    border-bottom: 1px solid #F0F2F8;
}
.sheet-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}
.sheet-script-name {
    font-size: 1rem;
    font-weight: 800;
    color: #1A1E2B;
    margin-bottom: 4px;
}
.sheet-segment {
    display: inline-block;
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--custom-primary); /* Changed to use var directly instead of literal #C62E2E if it matches branding, but #C62E2E is the user's color so let's stick to user color where requested, or fallback */
    background: #FEF0F0;
    padding: 3px 10px;
    border-radius: 20px;
}
.sheet-cmp-area {
    text-align: right;
}
.sheet-cmp-label {
    font-size: 0.55rem;
    font-weight: 500;
    color: #8C94A8;
    text-transform: uppercase;
}
.sheet-cmp-value {
    font-size: 1.2rem;
    font-weight: 800;
    line-height: 1.2;
}
.sheet-change {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 30px;
    display: inline-block;
    margin-top: 2px;
}
.sheet-change.positive { color: #2C8E5A; background: #E9F6EF; }
.sheet-change.negative { color: #C62E2E; background: #FEF0F0; }

.sheet-bidask {
    background: #F8FAFF;
    margin: 10px 16px;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.sheet-bid, .sheet-ask {
    flex: 1;
    text-align: center;
}
.sheet-bidask-label {
    font-size: 0.6rem;
    font-weight: 500;
    color: #8C94A8;
    text-transform: uppercase;
    margin-bottom: 3px;
}
.sheet-bid-value, .sheet-ask-value {
    font-size: 0.9rem;
    font-weight: 700;
}
.sheet-bid-value { color: #2C8E5A; }
.sheet-ask-value { color: #C62E2E; }
.sheet-divider {
    width: 1px;
    height: 28px;
    background: #E8ECF0;
}

.sheet-ohlc {
    padding: 4px 16px;
}
.sheet-ohlc-title {
    font-size: 0.6rem;
    font-weight: 600;
    color: #5B677E;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.ohlc-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    background: #F8FAFF;
    padding: 8px;
    border-radius: 16px;
}
.ohlc-item {
    text-align: center;
}
.ohlc-label {
    font-size: 0.55rem;
    font-weight: 500;
    color: #8C94A8;
    text-transform: uppercase;
    margin-bottom: 4px;
}
.ohlc-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1A1E2B;
}
.ohlc-value.open { color: #2C8E5A; }
.ohlc-value.high { color: #2C8E5A; }
.ohlc-value.low { color: #C62E2E; }
.ohlc-value.close { color: #1A1E2B; }

.sheet-contract {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: #F8FAFF;
    margin: 6px 16px;
    border-radius: 16px;
}
.sheet-contract-label {
    font-size: 0.6rem;
    font-weight: 500;
    color: #8C94A8;
    display: flex;
    align-items: center;
    gap: 5px;
}
.sheet-contract-value {
    font-size: 0.7rem;
    font-weight: 600;
    color: #1A1E2B;
    background: #FFFFFF;
    padding: 3px 10px;
    border-radius: 30px;
}

.sheet-actions {
    padding: 12px 16px 20px;
    display: flex;
    gap: 10px;
}
.sheet-btn-buy, .sheet-btn-sell {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 40px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
}
.sheet-btn-buy {
    background: #2C8E5A;
    color: white;
}
.sheet-btn-buy:active { transform: scale(0.97); background: #236e46; }
.sheet-btn-sell {
    background: #C62E2E;
    color: white;
}
.sheet-btn-sell:active { transform: scale(0.97); background: #A82222; }

</style>
<style>
/* Dark Mode Overrides for Watchlist */
[data-theme="dark"] .mobile-app { background: #1a1f2d; }
[data-theme="dark"] .app-header { background: #1a1f2d; border-color: #2D3748; }
[data-theme="dark"] .segments-container { border-color: transparent; }
[data-theme="dark"] .segment-tab { color: #8C99B9; }
[data-theme="dark"] .segment-tab.active { color: #E8EAED; }
[data-theme="dark"] .segment-tab.active::after { background: #10B981; }
[data-theme="dark"] .logo-text { color: #E8EAED; }
[data-theme="dark"] .theme-toggle-btn { background: transparent; border: none; font-size: 1.1rem; margin-left: 10px; cursor:pointer;}
[data-theme="dark"] .folder-btn { background: #252b36; border-color: #374151; color: #8C99B9; }
[data-theme="dark"] .search-input { background: #252B3B !important; border-color: #374151 !important; color: #FFFFFF !important; }
[data-theme="dark"] .search-input::placeholder { color: #8C99B9; }
[data-theme="dark"] .search-icon { color: #8C99B9; }
[data-theme="dark"] .main-content { background: #1a1f2d; }
[data-theme="dark"] .search-results-frame { background: #13161f; border-color: #2D3748; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
[data-theme="dark"] .search-results-header { border-bottom-color: #2D3748; }
[data-theme="dark"] .search-results-title { color: #8F9BB3; }
[data-theme="dark"] .search-results-count { color: #60A5FA; }
[data-theme="dark"] .search-result-item { border-bottom-color: #2D3748; }
[data-theme="dark"] .search-result-item:hover { background: #1a1f2d; }
[data-theme="dark"] .search-result-name { color: #E8EAED; }
[data-theme="dark"] .search-result-meta { color: #6D758D; }
[data-theme="dark"] .search-result-price { color: #E8EAED; }
[data-theme="dark"] .add-pill-btn { background: #C62E2E; }
[data-theme="dark"] .add-pill-btn.added { background: #064E3B; color: #10B981; }
[data-theme="dark"] .watchlist-header-bar { border-color: transparent; }
[data-theme="dark"] .wl-title { color: #8C99B9; }
[data-theme="dark"] .wl-icon { color: #6D758D; }
[data-theme="dark"] .wl-count { background: #252b36; color: #8C99B9; }
[data-theme="dark"] .action-hint { color: #6D758D; }

[data-theme="dark"] .search-result-scroll::-webkit-scrollbar-thumb { background: #374151; }
[data-theme="dark"] .multi-select-bar { background: #252b36; border-color: #374151; }
[data-theme="dark"] .multi-select-row.top-row { background: #252b36; border-color: #374151; }
[data-theme="dark"] .multi-select-row.bottom-row { background: #252b36; }
[data-theme="dark"] .select-all-btn { background: #374151; color: #E8EAED; }
[data-theme="dark"] .exit-selection-btn { background: #374151; color: #E8EAED; }
[data-theme="dark"] .selected-count { background: #374151; color: #60A5FA; }
[data-theme="dark"] .instrument-card { background: #252b36; border: 1px solid rgba(255, 255, 255, 0.1); }
[data-theme="dark"] .instrument-card.selected-mode { background: #1E1515; border-color: #C62E2E; }
[data-theme="dark"] .custom-checkbox { background: #252b36; border-color: #3B445B; }
[data-theme="dark"] .instrument-symbol { color: #E8EAED; }
[data-theme="dark"] .exchange-badge { background: #374151; color: #9AA4BF; }
[data-theme="dark"] .empty-watchlist { background: #252b36; border-color: #374151; }

/* Watchlist Drawer */
[data-theme="dark"] .folder-drawer { background: #252b36; border-left-color: #374151; }
[data-theme="dark"] .drawer-header { border-bottom-color: #374151; }
[data-theme="dark"] .drawer-header h3 { color: #E8EAED; }
[data-theme="dark"] .tree-item-li { border-bottom-color: #374151; }
[data-theme="dark"] .tree-label-row { color: #E8EAED; }
[data-theme="dark"] .tree-item-li:hover .tree-label-row { background: #1a1f2d; }
[data-theme="dark"] .tree-label-row span.bg-gray-100 { background: #374151; color: #8F9BB3; }
[data-theme="dark"] .tree-item-li ul li.hover\:bg-gray-50:hover { background: #1a1f2d; }
[data-theme="dark"] .drawer-footer { border-top-color: #374151; }

/* Trade Sheet */
[data-theme="dark"] .trade-sheet { background: #252b36; }
[data-theme="dark"] .sheet-handle .handle-bar { background: #374151; }
[data-theme="dark"] .sheet-header { border-bottom-color: #374151; }
[data-theme="dark"] .sheet-script-name { color: #E8EAED; }
[data-theme="dark"] .sheet-segment { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .sheet-cmp-label { color: #6D758D; }
[data-theme="dark"] .sheet-bidask { background: #13161f; }
[data-theme="dark"] .sheet-divider { background: #374151; }
[data-theme="dark"] .ohlc-grid { background: #13161f; }
[data-theme="dark"] .ohlc-value.close { color: #E8EAED; }
[data-theme="dark"] .sheet-contract { background: #13161f; }
[data-theme="dark"] .sheet-contract-value { background: #374151; color: #E8EAED; }
</style>
