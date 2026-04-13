<template>
    <div class="mobile-app relative">
        <div class="app-header">
            <div class="header-top">
                <div class="logo-area">
                    <button @click="$router.push({ name: 'profile' })" class="header-btn" style="border: none; padding: 0 8px; background: transparent; font-size: 1.1rem; color: #1A1E2B;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="logo-text">Trade History</div>
                </div>
                <div class="header-buttons">
                    <button class="header-btn active">Position History</button>
                    <button @click="exportTradeReport" :disabled="!trades.length" class="header-btn text-custom-green border-custom-green/30 disabled:opacity-50" title="Download Excel">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            
            <!-- Compact Date Filter Row -->
            <div class="date-filter-row">
                <div class="filter-group">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" class="date-input-compact" v-model="params.start_date">
                </div>
                <span style="color: #C62E2E; font-size: 0.7rem;">→</span>
                <div class="filter-group">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" class="date-input-compact" v-model="params.end_date">
                </div>
                <div class="filter-buttons">
                    <button class="filter-btn apply" @click="applyFilters">Apply</button>
                    <button class="filter-btn clear" @click="clearFilters">Clear</button>
                </div>
            </div>

            <!-- Limit and Pagination control in Header to save space -->
            <div class="flex justify-between items-center px-1 mt-2">
                <div class="flex items-center gap-2">
                    <span style="font-size: 0.65rem; font-weight: 600; color: #5B677E;">Results:</span>
                    <select v-model="params.limit" @change="applyFilters" style="border:1px solid #E8ECF0; border-radius: 4px; padding: 2px; font-size:0.7rem; font-weight:600; outline:none; background: #fff;">
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="main-content relative pb-24">
            <!-- History List -->
            <div class="history-list mt-1">
                
                <div v-if="loading" class="empty-history">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C8E5A] mb-2"></div>
                    <p>Loading trades...</p>
                </div>

                <div v-else-if="!trades.length" class="empty-history">
                    <i class="fas fa-folder-open"></i>
                    <p>No trade history found</p>
                </div>

                <div v-else class="history-card" v-for="trade in trades" :key="trade.id">
                    <div class="history-card-header">
                        <div class="script-info">
                            <span class="script-name">{{ trade.symbol }}</span>
                            <span class="order-type-badge" :class="trade.side?.toLowerCase() || 'buy'">{{ trade.side?.[0] }}</span>
                            <span style="font-size: 0.55rem; color: #9AA4BF;">{{ trade.exchange }}</span>
                        </div>
                        <div class="pnl" :class="Number(trade.realized_pnl) >= 0 ? 'positive' : 'negative'">
                            {{ Number(trade.realized_pnl) >= 0 ? '+' : '' }}₹{{ Math.abs(Number(trade.realized_pnl)).toFixed(2) }}
                        </div>
                    </div>
                    <div class="history-card-details">
                        <span class="detail-item"><i class="fas fa-layer-group"></i> {{ trade.buy_quantity }}</span>
                        <span class="detail-item"><i class="fas fa-arrow-right"></i> ₹{{ Number(trade.buy_price).toFixed(2) }}</span>
                        <span class="detail-item"><i class="fas fa-arrow-left"></i> ₹{{ Number(trade.sell_price).toFixed(2) }}</span>
                        <span class="detail-item"><i class="far fa-calendar"></i> {{ formatDate(trade.updated_at) }}</span>
                    </div>
                    <div class="history-card-details" style="margin-top: 4px;">
                        <span class="detail-item"><i class="fas fa-receipt"></i> Brokerage: ₹{{ Number(trade.brokerage).toFixed(2) }}</span>
                    </div>
                </div>
                
                <!-- PAGINATION -->
                <div v-if="totalPages > 1 && !loading" class="flex justify-between items-center py-4 px-2">
                    <button @click="prevPage" :disabled="currentPage === 1" class="filter-btn clear disabled:opacity-50">Prev</button>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #5B677E;">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="filter-btn clear disabled:opacity-50">Next</button>
                </div>
            </div>

            <!-- Reduced Bottom Summary -->
            <div class="history-footer sticky bottom-0 z-10" v-if="trades.length && !loading">
                <div class="footer-row">
                    <span class="footer-label"><i class="fas fa-arrow-up"></i> Gross Profit</span>
                    <span class="footer-value" style="color: #2C8E5A">₹{{ grossProfit.toFixed(2) }}</span>
                </div>
                <div class="footer-row">
                    <span class="footer-label"><i class="fas fa-arrow-down"></i> Gross Loss</span>
                    <span class="footer-value" style="color: #C62E2E">₹{{ grossLoss.toFixed(2) }}</span>
                </div>
                <div class="footer-row">
                    <span class="footer-label"><i class="fas fa-receipt"></i> Brokerage</span>
                    <span class="footer-value">₹{{ totalBrokerage.toFixed(2) }}</span>
                </div>
                <div class="footer-row">
                    <span class="footer-label"><i class="fas fa-chart-line"></i> Net P&L</span>
                    <span class="footer-value" :class="netPnL >= 0 ? 'net-profit' : 'net-loss'">
                        {{ netPnL >= 0 ? '+' : '' }}₹{{ Math.abs(netPnL).toFixed(2) }}
                    </span>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradeReportStore } from '@/stores/trade-reports'
import * as XLSX from 'xlsx'

const tradeStore = useTradeReportStore()
const { trades, params, currentPage, totalPages, loading } = storeToRefs(tradeStore)

/* ---------- ACTIONS ---------- */
const applyFilters = () => {
    params.value.page = 1
    tradeStore.getTradeReport()
}

const clearFilters = () => {
    params.value.start_date = ''
    params.value.end_date = ''
    params.value.page = 1
    tradeStore.getTradeReport()
}

const nextPage = () => {
    params.value.page++
    tradeStore.getTradeReport()
}

const prevPage = () => {
    params.value.page--
    tradeStore.getTradeReport()
}

/* ---------- COMPUTED SUMMARY ---------- */
const grossProfit = computed(() => {
    return trades.value.filter(t => Number(t.realized_pnl) > 0).reduce((sum, t) => sum + Number(t.realized_pnl), 0)
})

const grossLoss = computed(() => {
    return Math.abs(trades.value.filter(t => Number(t.realized_pnl) < 0).reduce((sum, t) => sum + Number(t.realized_pnl), 0))
})

const totalBrokerage = computed(() => {
    return trades.value.reduce((sum, t) => sum + Number(t.brokerage), 0)
})

const netPnL = computed(() => {
    return trades.value.reduce((sum, t) => sum + Number(t.realized_pnl), 0) - totalBrokerage.value
})

/* ---------- HELPERS ---------- */
const formatDate = v => {
    if (!v) return '-'
    const d = new Date(v)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ---------- EXCEL DOWNLOAD ---------- */
const exportTradeReport = () => {
    if (!trades.value.length) return

    const rows = trades.value.map(t => ({
        Symbol: t.symbol,
        Segment: t.segment,
        Exchange: t.exchange,
        Side: t.side,
        Quantity: t.buy_quantity,
        Buy_Price: Number(t.buy_price),
        Sell_Price: Number(t.sell_price),
        Brokerage: Number(t.brokerage),
        PnL: Number(t.realized_pnl),
        Stoploss: t.stoploss ?? '',
        Target: t.target ?? '',
        Date: new Date(t.updated_at).toLocaleString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trade Report')

    XLSX.writeFile(
        workbook,
        `trade-report-${new Date().toISOString().slice(0, 10)}.xlsx`
    )
}

</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

.mobile-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
    background: #FFFFFF;
    position: relative;
    font-family: 'Inter', sans-serif;
    color: #1A1E2B;
}

.app-header {
    background: #FFFFFF;
    padding: 14px 16px;
    border-bottom: 1px solid #E8ECF0;
    flex-shrink: 0;
}

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
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

.header-buttons {
    display: flex;
    gap: 8px;
}

.header-btn {
    background: #F8F9FC;
    border: 1px solid #E2E6EC;
    border-radius: 40px;
    padding: 6px 14px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: #5B677E;
}

.header-btn.active {
    background: #C62E2E;
    border-color: #C62E2E;
    color: white;
}

.date-filter-row {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 10px 12px;
    margin-top: 8px;
    border: 1px solid #EEF2F8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #F8FAFF;
    padding: 5px 12px;
    border-radius: 30px;
    border: 1px solid #E8ECF0;
}

.filter-group i {
    color: #9AA4BF;
    font-size: 0.7rem;
}

.date-input-compact {
    border: none;
    background: transparent;
    font-size: 0.7rem;
    font-family: inherit;
    padding: 5px 0;
    width: 105px;
    font-weight: 500;
    color: #1A1E2B;
    outline: none;
}

.filter-buttons {
    display: flex;
    gap: 6px;
}

.filter-btn {
    padding: 5px 14px;
    border-radius: 30px;
    font-size: 0.65rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

.filter-btn.apply {
    background: #2C8E5A;
    color: white;
}

.filter-btn.clear {
    background: #F0F2F5;
    color: #5B677E;
}

.filter-btn:active {
    transform: scale(0.96);
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
}

.history-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
}

.history-card {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 14px;
    border: 1px solid #EEF2F8;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.history-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
}

.script-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.script-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #1A1E2B;
}

.order-type-badge {
    font-size: 0.55rem;
    padding: 3px 10px;
    border-radius: 30px;
    font-weight: 600;
    text-transform: uppercase;
}

.order-type-badge.buy {
    background: #E9F6EF;
    color: #2C8E5A;
}

.order-type-badge.sell {
    background: #FEF0F0;
    color: #C62E2E;
}

.pnl {
    font-weight: 700;
    font-size: 0.85rem;
}

.pnl.positive {
    color: #2C8E5A;
}

.pnl.negative {
    color: #C62E2E;
}

.history-card-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.65rem;
    color: #8C94A8;
    padding-top: 8px;
    border-top: 1px solid #F0F2F8;
    margin-top: 4px;
    flex-wrap: wrap;
    gap: 8px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.detail-item i {
    width: 12px;
    font-size: 0.6rem;
}

.history-footer {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 12px 16px;
    border: 1px solid #E8ECF0;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
}

.footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 0.8rem;
}

.footer-row:not(:last-child) {
    border-bottom: 1px solid #F0F2F8;
}

.footer-label {
    color: #6B728E;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
}

.footer-value {
    font-weight: 700;
    font-size: 0.85rem;
}

.footer-value.net-profit {
    color: #2C8E5A;
}

.footer-value.net-loss {
    color: #C62E2E;
}

.empty-history {
    text-align: center;
    padding: 60px 24px;
    background: #FFFFFF;
    border-radius: 28px;
    border: 1px dashed #DCE3EC;
    color: #9CA3B9;
    margin-top: 20px;
}

.empty-history i {
    font-size: 2.5rem;
    margin-bottom: 12px;
    opacity: 0.5;
}

.empty-history p {
    font-size: 0.85rem;
    font-weight: 500;
}
</style>