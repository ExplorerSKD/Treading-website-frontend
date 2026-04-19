<template>
    <Modal v-model="showModifyModal" @close="closeModal">
        <div class="rounded-xl w-full mx-auto text-custom-text">
            <!-- HEADER -->
            <div class="flex items-center gap-4 p-2 justify-between">
                <button @click="closeModal"
                    class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">
                    <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />
                </button>

                <div class="text-sm font-semibold border rounded-lg border-custom-border px-2 py-1  text-custom-text">
                    Modifying Order
                </div>
            </div>

            <!-- SYMBOL HEADER -->
            <div class="border-b border-custom-border px-4 py-3">
                <div class="flex justify-between items-center">
                    <p class="text-base font-semibold">{{ selectedOrder?.symbol }}</p>
                    <span class="text-xs font-semibold px-2 py-1 rounded" :class="{
                        'bg-custom-green/10 text-custom-green': selectedOrder?.status === 'EXECUTED',
                        'bg-custom-text/10 text-custom-text': selectedOrder?.status === 'OPEN',
                        'bg-custom-red/10 text-custom-red': selectedOrder?.status === 'REJECTED'
                    }">
                        {{ selectedOrder?.status }}
                    </span>
                </div>
                <div class="flex justify-between items-center mt-1">
                    <div>
                        <p class="text-xs text-custom-grey">
                            {{ selectedOrder?.exchange }}
                        </p>
                        <div class="flex gap-3 text-xs mt-1">
                            <p :class="getBidAskColor(live.bid)" class="font-semibold">
                                Bid: {{ formatNumber(live.bid) || '-' }}
                            </p>
                            <p :class="getBidAskColor(live.ask)" class="font-semibold">
                                Ask: {{ formatNumber(live.ask) || '-' }}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-base font-semibold" :class="getColor(live.change)">
                            {{ formatNumber(live.ltp) }}
                        </p>
                        <p class="text-[calc(12px*var(--font-scale))]" :class="getColor(live.change)">
                            {{ formatNumber(live.change) }} ({{ formatNumber(live.changeP) }}%)
                        </p>
                    </div>
                </div>
            </div>

            <!-- OHLC -->
            <div class="flex justify-between px-2 py-1 text-[calc(12px*var(--font-scale))] text-custom-grey border-b border-custom-border">
                <div class="font-semibold">O: {{ formatNumber(live.open) }}</div>
                <div class="font-semibold">H: {{ formatNumber(live.high) }}</div>
                <div class="font-semibold">L: {{ formatNumber(live.low) }}</div>
                <div class="font-semibold">C: {{ formatNumber(live.close) }}</div>
            </div>

            <!-- LOT INFO -->
            <div class="flex justify-between px-2 py-1 text-[calc(12px*var(--font-scale))] bg-custom-border/30 rounded">
                <p class="font-semibold">Lot Size: {{ lotSize }}</p>
                <p class="font-semibold">
                    {{ isLotSelected ? 'Qty' : 'Lots' }}: {{ isLotSelected ? quantity : lots?.toFixed(2) }}
                </p>
            </div>

            <!-- BODY -->
            <div class="p-4 space-y-3">
                <!-- ORDER TYPE -->
                <!-- TABS -->
                <!-- <div class="flex text-[calc(14px*var(--font-scale))] justify-between border-b border-custom-border">
                    <button @click="activeTab = 'LIMIT'" :class="activeTab === 'LIMIT' ? activeBtn : inactiveBtn">
                        LIMIT
                    </button>

                    <button @click="activeTab = 'SLTP'" :class="activeTab === 'SLTP' ? activeBtn : inactiveBtn">
                        SL / TARGET
                    </button>
                </div> -->


                <!-- PRICE + LOT/QTY -->
                <!-- LIMIT TAB -->
                <div v-if="activeTab === 'LIMIT'" class="grid grid-cols-2 gap-4">

                    <!-- PRICE (only if order is LIMIT type) -->
                    <div v-if="selectedOrder?.order_type === 'LIMIT'">
                        <label class="text-xs font-semibold text-custom-grey">Price</label>
                        <input type="number" v-model.number="price" :placeholder="live.ltp"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                    </div>
                    <div v-if="selectedOrder?.order_type === 'SL-M'">
                        <label class="text-xs font-semibold text-custom-grey">Price</label>
                        <input type="number" v-model.number="price"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                    </div>

                    <!-- LOT / QTY -->
                    <div class="relative">
                        <label class="text-xs font-semibold text-custom-grey">
                            {{ isLotSelected ? 'Lots' : 'Quantity' }}
                        </label>

                        <input type="number" :min="isLotSelected ? (lotSize === 1 ? 1 : 0.5) : 1"
                            :step="isLotSelected ? 0.5 : 1" v-model.number="inputValue"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />

                        <button @click="toggleLot" class="absolute top-9 right-2 bg-custom-primary rounded-full p-1">
                            <img src="/sync.svg" class="w-5 transition-transform"
                                :class="{ 'rotate-90': isLotSelected }" />
                        </button>
                    </div>

                </div>


                <!-- SL / TARGET TAB -->
                <div v-if="activeTab === 'SLTP'" class="grid grid-cols-2 gap-3">
                    <div>

                        <label class="text-xs font-semibold text-custom-grey">Stoploss</label>
                        <input type="number" v-model.number="stoploss" placeholder="Stoploss"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                    </div>
                    <div>

                        <label class="text-xs font-semibold text-custom-grey">Target</label>
                        <input type="number" v-model.number="target" placeholder="Target"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                    </div>
                </div>

            </div>

            <!-- MARGIN CALCULATION -->
            <div class="p-4 border-t border-custom-border">
                <div class="flex items-center justify-between mb-4">
                    <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                        Intraday : <span class="text-custom-text">{{ formatNumber(fundCalculation.reqFunds) }}</span>
                    </p>
                    <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                        Carry : <span class="text-custom-text">{{ formatNumber(fundCalculation.reqCarry) }}</span>
                    </p>
                    <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                        Avail. Margin = <span class="text-custom-text">{{ formatNumber(availableMargin) }}</span>
                    </p>
                </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="grid grid-cols-2 gap-3 p-4 border-t border-custom-border">
                <button @click="modifyOrder" :disabled="isModifying || !isFormValid"
                    class="py-3 rounded-lg font-semibold bg-custom-primary text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isModifying ? 'MODIFYING...' : 'MODIFY' }}
                </button>
                <button @click="deleteOrder" :disabled="isDeleting"
                    class="py-3 rounded-lg font-semibold bg-custom-red text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isDeleting ? 'DELETING...' : 'DELETE' }}
                </button>
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '@/components/Modal.vue'
import ButtonSwitch from '@/components/ButtonSwitch.vue'
import { useOrderStore } from '@/stores/orders'
import { useTickerStore } from '@/stores/ticker'
import { useWalletStore } from '@/stores/wallet'
import { usePositionStore } from '@/stores/position'
import { useProfileStore } from '@/stores/profile'
import { useScriptSettingStore } from '@/stores/scriptsetting'
import { symbolSegment } from '@/utils/symbolsegment'
import { calculatePnl, formatNumber } from '@/utils/pnl'

const orderStore = useOrderStore()
const tickerStore = useTickerStore()
const walletStore = useWalletStore()
const positionStore = usePositionStore()
const profileStore = useProfileStore()
const scriptSettingStore = useScriptSettingStore()

const { scriptSettings } = storeToRefs(scriptSettingStore)
const { profile } = storeToRefs(profileStore)
const { wallet } = storeToRefs(walletStore)
const { openPositions } = storeToRefs(positionStore)

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    order: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'orderModified', 'orderDeleted'])

const showModifyModal = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const selectedOrder = computed(() => props.order)

/* ---------- COLORS ---------- */
function getColor(val) {
    if (val > 0) return 'text-custom-green'
    if (val < 0) return 'text-custom-red'
    return 'text-custom-grey'
}

function getBidAskColor(val) {
    if (val > 0) return 'text-custom-green'
    if (val < 0) return 'text-custom-red'
    return 'text-custom-text'
}

/* ---------- TOKEN RESOLUTION ---------- */
const tickerKey = computed(() => {
    if (!selectedOrder.value) return null
    if (symbolSegment.includes(selectedOrder.value.exchange)) {
        return String(selectedOrder.value.symbol)
    }
    return selectedOrder.value.instrument_token
})

/* ---------- TICK DATA (NORMALIZED) ---------- */
const tick = computed(() =>
    tickerKey.value ? tickerStore.getLastPrice(tickerKey.value) || {} : {}
)

const live = computed(() => ({
    ltp: tick.value?.ltp ?? 0,
    bid: tick.value?.bid ?? 0,
    ask: tick.value?.ask ?? 0,
    open: tick.value?.o ?? 0,
    high: tick.value?.h ?? 0,
    low: tick.value?.l ?? 0,
    close: tick.value?.c ?? 0,
    change: tick.value?.change ?? 0,
    changeP: tick.value?.c ? ((tick.value.ltp - tick.value.c) / tick.value.c) * 100 : 0
}))

// Form State
const activeTab = ref('LIMIT')

const price = ref(0)
const quantity = ref(0)
const lots = ref(0)
const stoploss = ref(0)
const target = ref(0)
const isLotSelected = ref(true)
const isModifying = ref(false)
const isDeleting = ref(false)

// Lot Size
const lotSize = computed(() => {
    if (selectedOrder.value && selectedOrder.value.quantity && selectedOrder.value.lots) {
        const calculatedLotSize = Math.round(selectedOrder.value.quantity / parseFloat(selectedOrder.value.lots))
        return calculatedLotSize > 0 ? calculatedLotSize : 1
    }
    return 1 // Falls through because lots is null
})

// Initialize form when order changes
watch(() => props.order, (newOrder) => {
    if (newOrder) {
        price.value = parseFloat(newOrder.order_type == 'SL-M' ? newOrder.trigger_price : newOrder.price) || 0
        quantity.value = parseInt(newOrder.quantity) || 0
        lots.value = parseFloat(newOrder.lots) || 0
        stoploss.value = parseFloat(newOrder.stoploss) || 0
        target.value = parseFloat(newOrder.target) || 0

    }
}, { immediate: true })


// Input Value Management
const inputValue = computed({
    get() {
        return isLotSelected.value ? lots.value : quantity.value
    },
    set(v) {
        if (v === '' || v === null || v === undefined) {
            if (isLotSelected.value) {
                lots.value = ''
            } else {
                quantity.value = ''
            }
            return
        }

        const numValue = Number(v)

        if (numValue <= 0) {
            if (isLotSelected.value) {
                lots.value = v
            } else {
                quantity.value = v
            }
            return
        }

        if (isLotSelected.value) {
            const minLot = lotSize.value === 1 ? 1 : 0.5
            lots.value = Math.max(minLot, numValue)
            quantity.value = Math.round(lots.value * lotSize.value)
        } else {
            quantity.value = Math.max(1, Math.round(numValue))
            lots.value = quantity.value / lotSize.value
        }
    }
})

const toggleLot = () => {
    if (isLotSelected.value) {
        // switching to quantity
        quantity.value = Math.round(lots.value * lotSize.value)
    } else {
        // switching to lots
        lots.value = quantity.value / lotSize.value
    }
    isLotSelected.value = !isLotSelected.value
}

// Styles
const activeBtn = 'border-b-2 border-custom-primary text-custom-primary flex-1 py-2'
const inactiveBtn = 'bg-white border-b-2 border-white text-custom-primary flex-1 py-2'

/* ---------- SEGMENT SETTINGS ---------- */
const getActiveSegment = (order) => {
    if (!order?.exchange || !order?.transaction_type) return null

    const key = `${order.exchange}-${order.transaction_type}`

    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(order.exchange) && (s.scripts?.includes('ALL') || s.scripts?.includes(order.symbol)))

    const hasScriptOverride =
        script &&
        script.segments?.includes(order.exchange) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(order.symbol)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings?.[key] || null
}

const activeSegmentSettings = computed(() => {
    if (!selectedOrder.value?.segment) return null

    const key = selectedOrder.value.segment

    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(selectedOrder.value.exchange) && (s.scripts?.includes('ALL') || s.scripts?.includes(selectedOrder.value.symbol)))

    const hasScriptOverride =
        script &&
        script.segments?.includes(selectedOrder.value.exchange) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(selectedOrder.value.symbol)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings?.[key] || null
})

/* ---------- UTILIZED FUNDS ---------- */
const utilizedFunds = computed(() => {
    let sum = 0

    openPositions.value.forEach(pos => {

        const activeSegmentSet = getActiveSegment(pos)
        const reqMargin = pos.side == 'BUY' ? pos.buy_value : pos.sell_value
        const totalLots = pos.lots

        const leverage = ['CNC', 'NRML'].includes(pos.product_type) ?
            activeSegmentSet?.holding_leverage : activeSegmentSet?.intraday_leverage

        const type = ['CNC', 'NRML'].includes(pos.product_type) ? activeSegmentSet?.holding_leverage_type : activeSegmentSet?.intraday_leverage_type


        const calcFunds = (type, margin, leverage, lots) => {

            let result = margin

            if (type === 'fixed_leverage') {
                result = margin - leverage
            }

            else if (type === 'fixed') {
                result = lots * leverage
            }

            else result = margin / leverage

            return Math.max(0, Number(result).toFixed(2))
        }
        sum += calcFunds(type, reqMargin, leverage, totalLots)
    })

    return sum
})

/* ---------- TOTAL PNL ---------- */
const totalPnl = computed(() => {
    let sum = 0
    openPositions.value.forEach(pos => {
        sum += Number(calculatePnl(pos, tickerStore) || 0)
    })
    return sum
})

/* ---------- FUND CALCULATION ---------- */
const fundCalculation = computed(() => {
    const currentPrice = price.value > 0 ? price.value : live.value.ltp

    const reqMargin = quantity.value * currentPrice
    const totalLots = lots.value

    const intradayLeverage = activeSegmentSettings.value?.intraday_leverage || 1
    const holdingLeverage = activeSegmentSettings.value?.holding_leverage || 1

    const intradayType = activeSegmentSettings.value?.intraday_leverage_type
    const holdingType = activeSegmentSettings.value?.holding_leverage_type

    const calcFunds = (type, margin, leverage, lots) => {

        let result = margin
        if (type === 'fixed_leverage') {
            result = margin - leverage
        }

        else if (type === 'fixed') {
            result = lots * leverage
        }

        else result = margin / leverage

        return Math.max(0, Number(result).toFixed(2))
    }

    return {
        reqMargin,
        availFunds: (wallet.value?.balance || 0) - utilizedFunds.value,
        reqFunds: calcFunds(intradayType, reqMargin, intradayLeverage, totalLots),
        reqCarry: calcFunds(holdingType, reqMargin, holdingLeverage, totalLots)
    }
})

/* ---------- AVAILABLE MARGIN ---------- */
const availableMargin = computed(() => {
    const balance = Number(wallet.value?.balance || 0)
    return balance - utilizedFunds.value + (totalPnl.value >= 0 ? 0 : totalPnl.value)
})

/* ---------- FORM VALIDATION ---------- */
const isFormValid = computed(() => {
    // Check if quantity is valid
    if (!quantity.value || quantity.value <= 0) return false

    // For LIMIT orders, price must be set and greater than 0
    if (selectedOrder.value?.order_type === 'LIMIT') {
        if (!price.value || price.value <= 0) return false
    }

    return true
})

// Actions
const modifyOrder = async () => {
    if (!selectedOrder.value?.id) return

    isModifying.value = true

    const orderType = selectedOrder.value.order_type
    const payload = {
        quantity: quantity.value,
        lots: parseFloat(lots.value.toFixed(2)),

        // LIMIT → trigger_price
        ...(orderType == 'LIMIT' && {
            price: Number(price.value)
        }),

        // SL-M → stoploss
        ...(orderType == 'SL-M' && price.value > 0 && {
            trigger_price: Number(price.value)
        })
    }

    try {
        const res = await orderStore.placeOrders(payload, selectedOrder.value.id)
        if (res) {
            closeModal()
        }
    } finally {
        isModifying.value = false
    }
}


const deleteOrder = async () => {
    if (!selectedOrder.value?.id) return

    isDeleting.value = true

    try {
        const res = await orderStore.deleteOrder(selectedOrder.value.id)
        if (res) {
            orderStore.getOrders()
        }
        closeModal()
    } finally {
        isDeleting.value = false
    }
}

const closeModal = () => {
    showModifyModal.value = false
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
/* Add any additional custom styles if needed */
</style>