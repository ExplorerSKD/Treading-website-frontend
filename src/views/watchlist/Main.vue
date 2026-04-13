<template>
  <div class="mobile-app">
    <!-- Header -->
    <div class="app-header">
      <div class="header-top">
        <div class="logo-area">
          <div class="logo-text">Watchlist</div>
        </div>
        <div class="folder-btn" @click="showDrawer = true">
          <i class="fas fa-folder"></i>
          <span>Trading Segments</span>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
      
      <!-- Search -->
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQueryInput"
          placeholder="Search stocks, futures, options..." 
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
      <div v-show="searchQueryInput" class="search-results-section relative z-10 bg-white">
        <div class="section-subtitle">
            <i class="fas fa-search"></i> SEARCH RESULTS 
            <span class="text-[0.6rem] ml-auto">
                {{ searchedInstruments.length }} results
            </span>
        </div>
        
        <div v-if="loading" class="py-6 flex justify-center">
            <LoaderComponent :show="true" />
        </div>
        <div v-else-if="searchedInstruments.length === 0" class="no-results">
            <i class="fas fa-search"></i> No matching scripts found
        </div>
        
        <div v-else class="search-result-list">
          <div 
             v-for="inst in searchedInstruments" 
             :key="inst.id" 
             class="search-result-item"
          >
            <div class="search-result-info">
              <div class="search-result-name">{{ inst.tradingsymbol }}</div>
              <div class="search-result-symbol">{{ inst.segment }} • {{ inst.expiry || 'N/A' }}</div>
            </div>
            
            <button 
               v-if="!isAlreadyAdded(inst)" 
               class="add-smart-btn"
               @click="addScript(inst)"
            >Add</button>
            <button 
               v-else 
               disabled
               class="add-smart-btn opacity-50 bg-gray-400"
            >Added</button>
          </div>
        </div>
      </div>

      <!-- Main Watchlist Area -->
      <div class="watchlist-section" v-show="!searchQueryInput">
        <div class="watchlist-header">
          <div class="watchlist-title-section">
            <div class="watchlist-title">
               <i class="fas fa-chart-line"></i> {{ activeSegment || 'MY WATCHLIST' }}
            </div>
            <div class="watchlist-count">{{ selectedWatchlist?.symbols?.length || 0 }} items</div>
          </div>
          <div class="action-hint">
             <i class="fas fa-arrows-left-right"></i> Swipe | 
             <i class="fas fa-fingerprint"></i> Hold | 
             <i class="fas fa-tap"></i> Tap
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <span class="add-hint"><i class="fas fa-plus-circle"></i> Add scripts by searching above</span>
        </div>
        
        <!-- Multi-select Menu Bar -->
        <div id="multiSelectBar" v-show="isDeleteMode">
          <div class="multi-select-bar">
            <div class="multi-select-row top-row">
              <div class="select-actions">
                  <button class="select-all-btn" @click="toggleSelectAll">
                      <i class="fas fa-check-double"></i> {{ isAllSelected ? 'Unselect All' : 'Select All' }}
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
            <p style="font-size:12px; margin-top:8px;">🔍 Search above to add instruments</p>
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
                        <div class="instrument-symbol flex items-center gap-2">
                           {{ item.symbol }}
                           <span v-if="!symbolSegment.includes(item.segment)" class="text-[0.6rem] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
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
            <span class="sheet-contract-label"><i class="fas fa-calendar-alt"></i> CONTRACT EXPIRY</span>
            <span class="sheet-contract-value">{{ formatSubtitle(currentTradeScript) }}</span>
        </div>
        
        <!-- Buttons -->
        <div class="sheet-actions">
            <button class="sheet-btn-buy" @click="executeTrade('BUY')"><i class="fas fa-arrow-up"></i> BUY</button>
            <button class="sheet-btn-sell" @click="executeTrade('SELL')"><i class="fas fa-arrow-down"></i> SELL</button>
        </div>
    </div>

        <!-- Folder Drawer (Segments) -->
    <div class="drawer-overlay" :class="{ 'active': showDrawer }" @click="showDrawer = false"></div>
    <div class="folder-drawer" :class="{ 'open': showDrawer }">
        <div class="drawer-header">
            <h3><i class="fas fa-folder"></i> Scripts Library</h3>
            <button class="close-drawer" @click="showDrawer = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="folder-tree-scroll">
            <ul class="tree-node-ul">
                <li v-for="(seg, idx) in tradingSegments" :key="idx" class="tree-item-li border-b border-gray-100 pb-2 mb-2">
                    <div class="tree-label-row flex justify-between" @click="toggleSegment(idx)">
                       <div class="flex items-center gap-3">
                           <i class="fas text-gray-400 w-3" :class="expandedSegments.includes(idx) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                           <i class="fas text-custom-primary" :class="seg.icon"></i>
                           <span class="font-bold text-gray-700 text-sm">{{ seg.name }}</span>
                       </div>
                       <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold">{{ getTotalCount(seg) }}</span>
                    </div>
                    
                    <ul v-if="expandedSegments.includes(idx)" class="pl-8 mt-2">
                        <!-- Direct Instruments -->
                        <li v-for="inst in seg.instruments || []" :key="inst.symbol" class="py-2 flex justify-between items-center px-2 hover:bg-gray-50 rounded">
                             <div class="flex items-center gap-3 text-xs font-semibold text-gray-600">
                                 <i class="fas fa-chart-line text-gray-400"></i>
                                 <span>{{ inst.symbol }}</span>
                             </div>
                             <button @click.stop="addMockScript(inst)" class="add-smart-btn text-white w-16" style="padding: 4px 10px; font-size: 0.65rem;">+ Add</button>
                        </li>
                        
                        <!-- SubCategories -->
                        <li v-for="(sub, sidx) in seg.subCategories || []" :key="sidx" class="mt-2">
                             <div class="flex items-center gap-2 text-xs font-semibold text-gray-700 px-2 py-1" @click="toggleSubcat(idx, sidx)">
                                 <i class="fas text-gray-400 w-3" :class="expandedSubcats.includes(idx+'-'+sidx) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                                 <i class="fas fa-building text-gray-400"></i>
                                 <span>{{ sub.name }}</span>
                             </div>
                             <ul v-if="expandedSubcats.includes(idx+'-'+sidx)" class="pl-6 mt-1 border-l mx-3 border-gray-200">
                                 <li v-for="sinst in sub.instruments || []" :key="sinst.symbol" class="py-2 flex justify-between items-center pl-2 pr-1 hover:bg-gray-50 rounded">
                                     <div class="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                                         <span>{{ sinst.symbol }}</span>
                                     </div>
                                     <button @click.stop="addMockScript(sinst)" class="add-smart-btn text-white w-16" style="padding: 4px 8px; font-size: 0.6rem;">+ Add</button>
                                 </li>
                             </ul>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="drawer-footer flex justify-between items-center mt-auto">
             <div class="text-[0.65rem] text-gray-500 font-medium">
                <i class="fas fa-plus-circle text-custom-primary"></i> Tap Add to put in Watchlist.
             </div>
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

const watchlistStore = useWatchlistStore()
const tickerStore = useTickerStore()
const profileStore = useProfileStore()
const router = useRouter()
const toastStore = useToastStore()

const { profile } = storeToRefs(profileStore)
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
const showDrawer = ref(false)
const showTradeSheet = ref(false)
const currentTradeScript = ref(null)

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
  await watchlistStore.addSymbolToWatchlist(payload)
  toastStore.addToast("Success", `${item.tradingsymbol} added to watchlist`, "success", 2000)
}

/* ---------------- DELETE FUNCTIONALITY (HOLD TO INTERACT) ---------------- */
const isDeleteMode = ref(false)
const selectedItems = ref([])

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

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedItems.value = []
    } else {
        selectedItems.value = selectedWatchlist.value.symbols.map(item => getItemId(item))
    }
}

const deleteSelected = async () => {
    if (selectedItems.value.length === 0) return

    await watchlistStore.deleteScripts(selectedItems.value)
    toastStore.addToast("Success", `Removed ${selectedItems.value.length} items`, "success", 2000)

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
    swipeStates.value[id] = { startX: clientX, currentX: 0, swiping: true }
}

const handleMove = (e, id) => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (!swipeStates.value[id]?.swiping || isDeleteMode.value) return;
    
    const deltaX = (e.touches ? e.touches[0].clientX : e.clientX) - swipeStates.value[id].startX
    let offset = Math.min(Math.max(deltaX, -80), 80)
    
    if (Math.abs(offset) > 70) {
        offset = offset * 0.8 + (offset > 0 ? 14 : -14)
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
    
    if (Math.abs(swipeStates.value[id].currentX) > 45) {
        // Trigger delete
        await watchlistStore.deleteScripts([id])
        toastStore.addToast("Success", `Instrument removed`, "success", 2000)
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
    // (If PlaceOrderModal doesn't know 'side', we just open it. We can augment order modal to receive predefined sides if necessary)
    showOrderModal.value = true;
    closeTradeSheet();
}

/* ---------------- DEMO LIBRARY DRAWER STATE ---------------- */
const expandedSegments = ref([0])
const expandedSubcats = ref([])

const toggleSegment = (idx) => {
    const pos = expandedSegments.value.indexOf(idx);
    if(pos > -1) expandedSegments.value.splice(pos, 1);
    else expandedSegments.value.push(idx);
}

const toggleSubcat = (idx, sidx) => {
    const key = idx + '-' + sidx;
    const pos = expandedSubcats.value.indexOf(key);
    if(pos > -1) expandedSubcats.value.splice(pos, 1);
    else expandedSubcats.value.push(key);
}

const getTotalCount = (seg) => {
    let count = 0;
    if (seg.instruments) count += seg.instruments.length;
    if (seg.subCategories) {
        seg.subCategories.forEach(sub => {
            if (sub.instruments) count += sub.instruments.length;
        });
    }
    return count;
}

const tradingSegments = [
    { name: "INDEX - FUTURE", icon: "fa-chart-line", instruments: [
        { name: "NIFTY FUT", symbol: "NIFTY FUT", segment: "INDEX-FUT" },
        { name: "SENSEX FUT", symbol: "SENSEX FUT", segment: "INDEX-FUT" },
        { name: "BANKNIFTY", symbol: "BANKNIFTY FUT", segment: "INDEX-FUT" },
        { name: "FINNIFTY", symbol: "FINNIFTY FUT", segment: "INDEX-FUT" },
        { name: "MIDCAP", symbol: "MIDCAP NIFTY", segment: "INDEX-FUT" }
    ]},
    { name: "INDEX - OPTIONS", icon: "fa-chart-pie", subCategories: [
        { name: "NIFTY Options", instruments: [
             { name: "22500 CE", symbol: "NIFTY 22500 CE", segment: "INDEX-OPT" },
             { name: "22500 PE", symbol: "NIFTY 22500 PE", segment: "INDEX-OPT" }
        ]},
        { name: "BANKNIFTY Options", instruments: [
             { name: "47500 CE", symbol: "BNF 47500 CE", segment: "INDEX-OPT" },
             { name: "47500 PE", symbol: "BNF 47500 PE", segment: "INDEX-OPT" }
        ]}
    ]},
    { name: "STOCKS - FUTURE", icon: "fa-building", instruments: [
        { name: "HDFC BANK", symbol: "HDFCBANK FUT", segment: "STOCK-FUT" },
        { name: "RELIANCE", symbol: "RELIANCE FUT", segment: "STOCK-FUT" },
        { name: "INFY", symbol: "INFY FUT", segment: "STOCK-FUT" }
    ]},
    { name: "STOCKS - OPTIONS", icon: "fa-cubes", instruments: [
        { name: "HDFC 1500 CE", symbol: "HDFC 1500 CE", segment: "STOCK-OPT" },
        { name: "RELIANCE 2900 CE", symbol: "RELIANCE 2900 CE", segment: "STOCK-OPT" }
    ]},
    { name: "MCX - FUTURE", icon: "fa-coins", instruments: [
        { name: "GOLD FUT", symbol: "GOLD FUT", segment: "MCX-FUT" },
        { name: "SILVER FUT", symbol: "SILVER FUT", segment: "MCX-FUT" },
        { name: "CRUDEOIL FUT", symbol: "CRUDEOIL FUT", segment: "MCX-FUT" }
    ]},
    { name: "NSE - EQ", icon: "fa-chart-area", instruments: [
        { name: "TATA MOTORS", symbol: "TATAMOTORS", segment: "NSE-EQ" },
        { name: "STATE BANK", symbol: "SBIN", segment: "NSE-EQ" },
        { name: "ICICI BANK", symbol: "ICICIBANK", segment: "NSE-EQ" },
        { name: "ITC LTD", symbol: "ITC", segment: "NSE-EQ" }
    ]},
    { name: "CRYPTO", icon: "fa-bitcoin", instruments: [
        { name: "BITCOIN", symbol: "BTCUSDT", segment: "CRYPTO" },
        { name: "ETHEREUM", symbol: "ETHUSDT", segment: "CRYPTO" },
        { name: "SOLANA", symbol: "SOLUSDT", segment: "CRYPTO" }
    ]}
];

const addMockScript = async (inst) => {
    // Make sure we have an active watchlist configured
    let currentList = selectedWatchlist.value;
    if(!currentList) {
        if(watchlists.value && watchlists.value.length > 0) {
            currentList = watchlists.value[0];
            selectedWatchlist.value = currentList;
            activeSegment.value = currentList.name;
        } else {
             // Create a fallback DEMO list if absolutely none exist
             watchlists.value = [{ name: 'DEMO', symbols: [] }];
             currentList = watchlists.value[0];
             selectedWatchlist.value = currentList;
             activeSegment.value = 'DEMO';
        }
    }

    if(!currentList.symbols) currentList.symbols = [];
    
    // Prevent duplicates
    const isAdded = currentList.symbols.find(s => s.symbol === inst.symbol);
    if(isAdded) {
       toastStore.addToast("Notice", `${inst.symbol} is already in Watchlist.`, "error", 2000);
       return;
    }

    // Push into the UI reactive state array
    currentList.symbols.push({
         name: inst.name,
         symbol: inst.symbol,
         segment: inst.segment,
         exchange: inst.segment.split('-')[0],
         token: "demo_" + Math.random().toString(36),
         instrument_type: "EQ"
    });
    
    toastStore.addToast("Success", `${inst.symbol} added (Demo Mode).`, "success", 2000);
}

/* ---------------- WATCHLIST SEGMENTS ---------------- */
const selectWatchlist = (segment) => {
    activeSegment.value = segment
    selectedWatchlist.value = watchlists.value.find(w => w.name === segment) || null
    isDeleteMode.value = false
    selectedItems.value = []
    showDrawer.value = false
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

/* Search Results */
.search-results-section {
    margin-bottom: 20px;
    background: #FFFFFF;
    border-radius: 20px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border: 1px solid #EEF2F8;
    flex-shrink: 0;
}

.section-subtitle {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--custom-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-result-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
}

.search-result-item {
    background: #F8F9FC;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #EFF2F8;
}

.search-result-info {
    flex: 1;
}

.search-result-name {
    font-weight: 600;
    font-size: 0.85rem;
    color: #1A1E2B;
}

.search-result-symbol {
    font-size: 0.65rem;
    color: #8F9BB3;
    margin-top: 2px;
}

.add-smart-btn {
    background: var(--custom-primary);
    border: none;
    color: white;
    border-radius: 30px;
    padding: 6px 14px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
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

.watchlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 0 4px;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.watchlist-title-section {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.watchlist-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: #8E95A8;
}

.watchlist-count {
    font-size: 0.7rem;
    background: #F0F2F5;
    padding: 4px 10px;
    border-radius: 20px;
    color: var(--custom-primary);
    font-weight: 600;
}

.add-hint {
    font-size: 0.6rem;
    color: var(--custom-primary);
    background: #FEF0F0;
    padding: 4px 12px;
    border-radius: 30px;
    display: inline-block;
    font-weight: 500;
}

.action-hint {
    font-size: 0.6rem;
    color: #9AA4BF;
    text-align: right;
    padding: 6px 12px;
    background: #F8F9FC;
    border-radius: 30px;
    display: inline-block;
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
    background: var(--custom-primary);
    border-color: var(--custom-primary);
}

.custom-checkbox.selected i {
    color: white;
    font-size: 11px;
}

.instrument-info {
    flex: 2;
}

.instrument-symbol {
    font-weight: 700;
    font-size: 1rem;
    color: #1A1E2B;
    margin-bottom: 4px;
}

.instrument-name {
    font-size: 0.7rem;
    color: #8C94A8;
}

.instrument-price-area {
    text-align: right;
    min-width: 85px;
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
[data-theme="dark"] .mobile-app { background: #080A0F; }
[data-theme="dark"] .app-header { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .logo-text { color: #E8EAED; }
[data-theme="dark"] .theme-toggle-btn { background: transparent; border: none; font-size: 1.1rem; margin-left: 10px; cursor:pointer;}
[data-theme="dark"] .folder-btn { background: #1C212E; border-color: #272C3D; color: #8C99B9; }
[data-theme="dark"] .search-input { background: #0A0D14; border-color: #272C3D; color: #E8EAED; }
[data-theme="dark"] .main-content { background: #080A0F; }
[data-theme="dark"] .search-results-section { background: #131722; border-color: #1E2230; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
[data-theme="dark"] .section-subtitle { color: #8F9BB3; }
[data-theme="dark"] .search-result-item { background: #1A1F2D; border-color: #272C3D; }
[data-theme="dark"] .search-result-name { color: #E8EAED; }
[data-theme="dark"] .watchlist-title { color: #6D758D; }
[data-theme="dark"] .watchlist-count { background: #1C212E; color: #8C99B9; }
[data-theme="dark"] .action-hint { background: #131722; color: #6D758D; }
[data-theme="dark"] .add-hint { background: #1A1F2D; color: #8F9BB3; }
[data-theme="dark"] .multi-select-bar { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .multi-select-row.top-row { background: #1A1F2D; border-color: #272C3D; }
[data-theme="dark"] .multi-select-row.bottom-row { background: #131722; }
[data-theme="dark"] .select-all-btn { background: #272C3D; color: #E8EAED; }
[data-theme="dark"] .exit-selection-btn { background: #272C3D; color: #E8EAED; }
[data-theme="dark"] .instrument-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .instrument-card.selected-mode { background: #1E1515; border-color: #C62E2E; }
[data-theme="dark"] .custom-checkbox { background: #131722; border-color: #3B445B; }
[data-theme="dark"] .instrument-symbol { color: #E8EAED; }
[data-theme="dark"] .instrument-symbol span { background: #222838; color: #9AA4BF; }
[data-theme="dark"] .empty-watchlist { background: #131722; border-color: #272C3D; }

/* Watchlist Drawer */
[data-theme="dark"] .folder-drawer { background: #131722; border-left-color: #1E2230; }
[data-theme="dark"] .drawer-header { border-bottom-color: #1E2230; }
[data-theme="dark"] .drawer-header h3 { color: #E8EAED; }
[data-theme="dark"] .tree-item-li { border-bottom-color: #1E2230; }
[data-theme="dark"] .tree-label-row { color: #E8EAED; }
[data-theme="dark"] .tree-item-li:hover .tree-label-row { background: #1A1F2D; }
[data-theme="dark"] .tree-label-row span.bg-gray-100 { background: #272C3D; color: #8F9BB3; }
[data-theme="dark"] .tree-item-li ul li.hover\:bg-gray-50:hover { background: #1E2230; }
[data-theme="dark"] .drawer-footer { border-top-color: #1E2230; }

/* Trade Sheet */
[data-theme="dark"] .trade-sheet { background: #131722; }
[data-theme="dark"] .sheet-handle .handle-bar { background: #2A3042; }
[data-theme="dark"] .sheet-header { border-bottom-color: #1E2230; }
[data-theme="dark"] .sheet-script-name { color: #E8EAED; }
[data-theme="dark"] .sheet-segment { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .sheet-cmp-label { color: #6D758D; }
[data-theme="dark"] .sheet-bidask { background: #0A0D14; }
[data-theme="dark"] .sheet-divider { background: #1E2230; }
[data-theme="dark"] .ohlc-grid { background: #0A0D14; }
[data-theme="dark"] .ohlc-value.close { color: #E8EAED; }
[data-theme="dark"] .sheet-contract { background: #0A0D14; }
[data-theme="dark"] .sheet-contract-value { background: #1E2230; color: #E8EAED; }
</style>
