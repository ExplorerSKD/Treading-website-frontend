<template>
  <div class="order-app">
    <AppHeader title="Orders" />

    <!-- Search -->
    <div class="search-container">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQuery"
          placeholder="Search symbol..." 
          autocomplete="off"
        >
        <i 
          class="fas fa-times-circle clear-search" 
          :class="{ 'visible': searchQuery.length > 0 }"
          @click="searchQuery = ''"
        ></i>
      </div>
    </div>

    <!-- Tabs -->
    <div class="order-tabs">
      <div 
         class="tab" 
         :class="{ 'active': activeOrderTab === 'OPEN' }" 
         @click="activeOrderTab = 'OPEN'"
      >
          OPEN
      </div>
      <div 
         class="tab" 
         :class="{ 'active': activeOrderTab === 'EXECUTED' }" 
         @click="activeOrderTab = 'EXECUTED'"
      >
          EXECUTED
      </div>
      <div 
         class="tab" 
         :class="{ 'active': activeOrderTab === 'REJECTED' }" 
         @click="activeOrderTab = 'REJECTED'"
      >
          REJECTED
      </div>
    </div>

    <!-- Orders List -->
    <div class="orders-container relative z-10" id="orders-container">
      
      <div v-if="loading" class="py-8 flex justify-center text-gray-400">
        <LoaderComponent :show="loading" />
      </div>

      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <i v-if="searchQuery" class="fas fa-search" style="font-size: 28px; margin-bottom: 8px; opacity: 0.4; display: block;"></i>
        <i v-else class="fas fa-box-open" style="font-size: 28px; margin-bottom: 8px; opacity: 0.4; display: block;"></i>
        {{ searchQuery ? 'No results for "' + searchQuery + '"' : 'No ' + activeOrderTab.toLowerCase() + ' orders found' }}
      </div>
      
      <div v-else>
         <div 
           v-for="order in filteredOrders" 
           :key="order.id"
           class="order-card"
           @click="handleOrderClick(order)"
         >
            <div class="order-header-row">
              <div class="flex items-center gap-2">
                 <span class="pair">{{ order.symbol }}</span>
                 <span class="text-[0.6rem] bg-gray-100 text-gray-500 px-1 font-semibold rounded">
                    {{ order.exchange }}
                 </span>
              </div>
              <span class="position-badge" :class="order.transaction_type === 'BUY' ? 'buy' : 'sell'">
                 <i class="fas" :class="order.transaction_type === 'BUY' ? 'fa-arrow-up' : 'fa-arrow-down'"></i> 
                 {{ order.transaction_type === 'BUY' ? 'LONG' : 'SHORT' }}
              </span>
            </div>

            <div class="compact-row">
              <span class="compact-label">PRICE <span v-if="order.average_price && order.average_price != '0.00'" class="text-[9px] lowercase opacity-50">(avg)</span></span>
              <span class="price-value" :class="order.transaction_type === 'BUY' ? 'text-[#059669]' : 'text-[#B22234]'">
                 {{ order.status === 'OPEN' ? getOrderPrice(order) : (formatNumber(order.average_price) !== '0.00' ? formatNumber(order.average_price) : '-') }}
              </span>
            </div>

            <div class="info-inline">
              <div class="info-block">
                <span class="info-label-sm">QTY</span>
                <span class="info-value-sm">{{ order.status == 'OPEN' ? order.quantity : order.filled_quantity }}</span>
              </div>
              <div class="info-block">
                <span class="info-label-sm">TYPE</span>
                <span class="order-type-badge-sm"><i class="fas fa-tag"></i> {{ order.order_type }}</span>
              </div>
              <div class="info-block">
                <span class="info-label-sm">TIME</span>
                <span class="info-value-sm">{{ formatTime(order.created_at) }}</span>
              </div>
            </div>

            <div class="time-compact">
              <span class="compact-label">DATE</span>
              <span class="time-value-sm">{{ formatDate(order.created_at) }}</span>
            </div>

            <div v-if="order.reason" class="rejection-reason mt-2">
               <i class="fas fa-exclamation-triangle"></i><span>{{ order.reason }}</span>
            </div>

            <div class="status-row">
              <div class="status-badge" :class="getStatusClass(order.status)">
                  <i class="fas" :class="getStatusIcon(order.status)"></i> {{ order.status }}
              </div>
              
              <button 
                  v-if="order.status === 'OPEN'" 
                  class="cancel-btn"
                  @click.stop="handleOrderClick(order)"
              >
                  <i class="fas fa-pen"></i> Modify / Cancel
              </button>
            </div>
         </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !loading" class="flex text-[13px] font-semibold justify-center items-center py-4 space-x-4 text-gray-500">
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
    </div>
    
    <ModifyOrderModal v-model="showModifyModal" :order="selectedOrderForModify" />
  </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/orders';
import { formatNumber } from '@/utils/pnl';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import ModifyOrderModal from './ModifyOrderModal.vue';
import LoaderComponent from '@/components/LoaderComponent.vue';
import AppHeader from '@/components/AppHeader.vue';

const orderStore = useOrderStore();
const activeOrderTab = computed({
    get: () => orderStore.params.type,
    set: (val) => orderStore.params.type = val
})
const { orders, totalPages, currentPage, loading } = storeToRefs(orderStore)
const showModifyModal = ref(false)
const selectedOrderForModify = ref(null)

const searchQuery = ref('');

const filteredOrders = computed(() => {
    if (!orders.value) return [];
    if (!searchQuery.value.trim()) return orders.value;
    
    const query = searchQuery.value.toLowerCase().trim();
    return orders.value.filter(o => 
         (o.symbol && o.symbol.toLowerCase().includes(query)) ||
         (o.exchange && o.exchange.toLowerCase().includes(query))
    );
});

watch(activeOrderTab, (tab) => {
    orderStore.params.type = tab
    orderStore.params.page = 1
    orderStore.getOrders()
})

const goToNextPage = () => {
    orderStore.params.page += 1;
    orderStore.getOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
const goToPreviousPage = () => {
    orderStore.params.page -= 1;
    orderStore.getOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const handleOrderClick = (order) => {
    if (order.status === 'OPEN') {
        selectedOrderForModify.value = order
        showModifyModal.value = true
    }
}

const getOrderPrice = (order) => {
    const prices = [
        order.price,
        order.average_price,
        order.trigger_price
    ]

    const validPrice = prices.find(
        p => p !== null && Number(p) > 0
    )

    return validPrice ? formatNumber(validPrice) : '-'
}

/* ---------------- Formatting Helpers ---------------- */
const formatTime = (ts) => {
    if(!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

const formatDate = (ts) => {
    if(!ts) return '';
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const getStatusClass = (status) => {
    if(status === 'EXECUTED') return 'completed';
    if(status === 'REJECTED') return 'rejected';
    return 'open';
}

const getStatusIcon = (status) => {
    if(status === 'EXECUTED') return 'fa-check-circle';
    if(status === 'REJECTED') return 'fa-times-circle';
    return 'fa-hourglass-half';
}

</script>

<style scoped>
/* Scoped exactly from User's Mock CSS */
* {
  box-sizing: border-box;
}

.order-app {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Inter', sans-serif;
  padding-bottom: 20px; /* buffer for bottom nav if any */
}


.search-container {
  padding: 6px 16px 4px 16px;
  flex-shrink: 0;
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
    color: #1F2937;
}

.search-input::placeholder {
    color: #9CA3AF;
}

.search-input:focus {
    outline: none;
    border-color: #1F2937;
    background: #FFFFFF;
    box-shadow: 0 0 0 2px rgba(31, 41, 55, 0.08);
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

.order-tabs {
  display: flex;
  margin: 4px 16px 10px 16px;
  background: #F8FAFE;
  border-radius: 44px;
  padding: 3px;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-weight: 500;
  font-size: 12px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
}

.tab.active {
  background: #FFFFFF;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-weight: 700;
}

.orders-container {
  padding: 0 14px 12px 14px;
  flex: 1;
}

/* Ultra compact professional card */
.order-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border: 1px solid #EDF2F7;
  transition: all 0.15s;
  cursor: pointer;
}
.order-card:active {
    background: #F8FAFF;
}

.order-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pair {
  font-weight: 800;
  font-size: 14px;
  color: #111827;
  letter-spacing: -0.2px;
}

.position-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 30px;
}

.position-badge.buy {
  background: #E9F6EF;
  color: #059669;
}

.position-badge.sell {
  background: #FEF2F2;
  color: #B22234;
}

/* Compact price row */
.compact-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.compact-label {
  font-size: 9px;
  font-weight: 600;
  color: #8B98A9;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.price-value {
  font-size: 15px;
  font-weight: 800;
}

/* Compact info row - 3 items inline */
.info-inline {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
  gap: 8px;
}

.info-block {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.info-label-sm {
  font-size: 9px;
  font-weight: 600;
  color: #8B98A9;
  text-transform: uppercase;
}

.info-value-sm {
  font-size: 11px;
  font-weight: 700;
  color: #1F2937;
}

.order-type-badge-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: #F3F4F6;
  color: #4B5563;
}

.order-type-badge-sm i {
  font-size: 8px;
}

/* Time row compact */
.time-compact {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.time-value-sm {
  font-size: 11px;
  font-weight: 600;
  color: #8B98A9;
}

.rejection-reason {
  margin-top: 6px;
  padding: 4px 8px;
  background: #FEF9E7;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #D97706;
  border-left: 3px solid #F59E0B;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #F0F4F9;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.open {
  color: #B22234;
}

.status-badge.completed {
  color: #059669;
}

.status-badge.rejected {
  color: #D97706;
}

/* Compact cancel button */
.cancel-btn {
  background: transparent;
  border: 1px solid #E5E9F0;
  border-radius: 30px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.cancel-btn:active {
  transform: scale(0.96);
  background: #FEF2F2;
  border-color: #FCA5A5;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #9CA3AF;
  font-size: 13px;
  background: #FAFCFE;
  border-radius: 20px;
  margin-top: 16px;
  font-weight: 500;
}

</style>
<style>
/* Dark Mode Overrides for Orders */
[data-theme="dark"] .order-app { background: #071824; color: #E8EAED; }
[data-theme="dark"] .search-input { background: #252B3B !important; border-color: #374151 !important; color: #FFFFFF !important; }
[data-theme="dark"] .search-input::placeholder { color: #8C99B9; }
[data-theme="dark"] .search-icon { color: #8C99B9; }
[data-theme="dark"] .order-tabs { background: #0f212e; }
[data-theme="dark"] .tab.active { background: #071824; color: #FFFFFF; }
[data-theme="dark"] .order-card { background: #0f212e; border-color: #2D3748; }
[data-theme="dark"] .order-card:active { background: #071824; }
[data-theme="dark"] .pair { color: #E8EAED; }
[data-theme="dark"] .position-badge.sell { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .position-badge.buy { background: #122921; color: #34D399; }
[data-theme="dark"] .info-value-sm { color: #E8EAED; }
[data-theme="dark"] .order-type-badge-sm { background: #071824; color: #9AA4BF; }
[data-theme="dark"] .rejection-reason { background: #2A2111; color: #FBBF24; border-left-color: #F59E0B; }
[data-theme="dark"] .status-row { border-top-color: #2D3748; }
[data-theme="dark"] .status-badge.open { color: #FCA5A5; }
[data-theme="dark"] .status-badge.completed { color: #34D399; }
[data-theme="dark"] .cancel-btn { border-color: #2D3748; color: #9AA4BF; }
[data-theme="dark"] .empty-state { background: #0f212e; color: #9AA4BF; }
</style>
