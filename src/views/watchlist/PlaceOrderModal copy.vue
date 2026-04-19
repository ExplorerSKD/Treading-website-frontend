<template>
    <Modal v-model="showOrderModal" @close="close">
        <div class="rounded-xl w-full mx-auto text-custom-text">
            <!-- HEADER -->
            <div class="border-b border-custom-border px-4 py-3">
                <div class="flex justify-between items-center">
                    <p class="text-base font-semibold">
                        {{ currentScript?.symbol }}
                    </p>
                    <span class="text-xs text-custom-grey">
                        {{ currentScript?.expiry_date }}
                    </span>
                </div>
                <div class="flex justify-between items-center mt-1">
                    <div>
                        <p class="text-xs text-custom-grey">
                            {{ currentScript?.segment }} | {{ currentScript?.instrument_type }}
                        </p>

                        <div class="flex gap-3 text-xs mt-1">
                            <p :class="bidAskColor(live.bid)" class="font-semibold">
                                Bid: {{ live.bid || '-' }}
                            </p>
                            <p :class="bidAskColor(live.ask)" class="font-semibold">
                                Ask: {{ live.ask || '-' }}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-base font-semibold" :class="priceColor">
                            {{ live.ltp }}
                        </p>
                        <p class="text-[calc(11px*var(--font-scale))]" :class="priceColor">
                            {{ live.change.toFixed(2) }} ({{ live.changeP.toFixed(2) }}%)
                        </p>
                    </div>
                </div>
            </div>

            <!-- OHLC -->
            <div class="grid grid-cols-4 text-[calc(11px*var(--font-scale))] text-custom-grey border-b border-custom-border">
                <div class="px-3 py-1 font-semibold">O: {{ live.open }}</div>
                <div class="px-3 py-1 font-semibold">H: {{ live.high }}</div>
                <div class="px-3 py-1 font-semibold">L: {{ live.low }}</div>
                <div class="px-3 py-1 font-semibold">C: {{ live.close }}</div>
            </div>

            <!-- POSITION MODE: PNL & EXIT ALL -->
            <div v-if="isPositionMode" class="border-b border-custom-border px-4 py-3 bg-custom-border/30">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs text-custom-grey">Current P&L</p>
                        <p class="text-lg font-bold" :class="getPnlClass(currentPnl)">
                            <span v-if="currentPnl > 0">+</span>{{ currentPnl.toFixed(2) }}
                        </p>
                    </div>
                    <button @click="exitAll"
                        class="px-4 py-2 rounded-lg font-semibold text-white bg-custom-red hover:bg-custom-red/90 transition">
                        Exit Position
                    </button>
                </div>
            </div>

            <!-- LOT INFO -->
            <div class="flex justify-between px-4 py-2 text-xs border-b border-custom-border">
                <p class="font-semibold">Lot Size: {{ lotSize }}</p>
                <p class="font-semibold">
                    {{ isLot ? 'Qty' : 'Lots' }} :
                    {{ isLot ? qty : lots.toFixed(2) }}
                </p>
            </div>

            <!-- BODY -->
            <div class="p-4 space-y-3">

                <!-- BUY / SELL SELECT -->
                <div class="grid grid-cols-2 gap-3 rounded-full p-1">
                    <button @click="side = 'BUY'" :disabled="isPositionMode" class="px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-150
               border-custom-green disabled:opacity-60 disabled:cursor-not-allowed" :class="side === 'BUY'
                ? 'bg-custom-green text-white'
                : 'text-custom-green hover:bg-custom-green/10 hover:text-custom-green'">
                        BUY
                    </button>

                    <button @click="side = 'SELL'" :disabled="isPositionMode" class="px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-150
               border-custom-red disabled:opacity-60 disabled:cursor-not-allowed" :class="side === 'SELL'
                ? 'bg-custom-red text-white'
                : 'text-custom-red hover:bg-custom-red/10 hover:text-custom-red'">
                        SELL
                    </button>
                </div>

                <div v-if="side" class="space-y-3">

                    <!-- POSITION MODE INDICATOR -->
                    <div v-if="isPositionMode" class="text-xs text-custom-grey text-center py-1">
                        <span class="font-semibold">Position Exit Mode</span> -
                        Side locked to {{ exitSide }}
                    </div>

                    <!-- ORDER TYPE -->
                    <div class="flex gap-2 rounded-full p-1 bg-custom-border w-fit">
                        <button @click="orderType = 'MARKET'" :class="orderType === 'MARKET' ? activeBtn : inactiveBtn">
                            Market
                        </button>
                        <button @click="orderType = 'LIMIT'" :class="orderType === 'LIMIT' ? activeBtn : inactiveBtn">
                            Limit
                        </button>
                    </div>

                    <!-- PRICE + LOT/QTY -->
                    <div class="">
                        <div>
                            <label class="text-xs font-semibold text-custom-grey">Price</label>
                            <input v-if="orderType == 'LIMIT'" type="number" :disabled="orderType === 'MARKET'"
                                v-model.number="price" :placeholder="live.ltp"
                                class="px-3 py-2 border w-full border-custom-border rounded-md text-sm disabled:opacity-50" />
                            <input v-else type="number" :disabled="orderType === 'MARKET'" v-model.number="live.ltp"
                                :placeholder="live.ltp"
                                class="px-3 py-2 border w-full border-custom-border rounded-md text-sm disabled:opacity-50" />
                        </div>

                        <div class="relative">
                            <label class="text-xs font-semibold text-custom-grey">
                                {{ isLot ? 'Lots' : 'Quantity' }}
                                <span v-if="isPositionMode" class="text-custom-primary">
                                    (Max: {{ maxPositionQty }})
                                </span>
                            </label>

                            <input type="number" :min="isLot ? (lotSize === 1 ? 1 : 0.5) : 1"
                                :max="isPositionMode ? maxPositionQty : undefined" :step="isLot ? 0.5 : 1"
                                v-model.number="inputValue"
                                class="px-3 py-2 border w-full border-custom-border rounded-md text-sm" />

                            <button @click="toggleLot"
                                class="absolute top-7 right-2 bg-custom-primary rounded-full p-1">
                                <img src="/sync.svg" class="w-4 transition-transform" :class="{ 'rotate-90': isLot }" />
                            </button>
                        </div>
                    </div>

                    <!-- SL / TARGET TOGGLE (Only in Order Mode) -->
                    <div v-if="!isPositionMode" class="flex items-center gap-2">
                        <ButtonSwitch v-model="enableSLTP" />
                        <span class="text-xs font-semibold text-custom-grey">
                            Enable Stoploss & Target
                        </span>
                    </div>

                    <!-- SL / TARGET (Only in Order Mode) -->
                    <div v-if="!isPositionMode && enableSLTP" class="grid grid-cols-2 gap-3">
                        <input type="number" v-model.number="stoploss" placeholder="Stoploss"
                            class="px-3 py-2 border w-full border-custom-border rounded-md text-sm" />
                        <input type="number" v-model.number="target" placeholder="Target"
                            class="px-3 py-2 border w-full border-custom-border rounded-md text-sm" />
                    </div>
                </div>
            </div>


            <!-- SUBMIT -->
            <div class="p-4 border-t border-custom-border">
                <!-- calculation -->
                <div v-if="!side" class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-[calc(13.33px*var(--font-scale))] font-semibold text-custom-grey">Avail. Funds = <span
                                class="text-custom-text">{{ fundCalculation.availFunds }}</span></p>
                        <p class="text-[calc(13.33px*var(--font-scale))] font-semibold text-custom-grey">Req Margin = <span
                                class="text-custom-text">{{ fundCalculation.reqMargin }}</span></p>
                    </div>
                    <div>
                        <p class="text-[calc(13.33px*var(--font-scale))] font-semibold text-custom-grey">Intraday Margin = <span
                                class="text-custom-text">{{ fundCalculation.reqFunds }}</span></p>
                        <p class="text-[calc(13.33px*var(--font-scale))] font-semibold text-custom-grey">Carry Margin = <span
                                class="text-custom-text">{{ fundCalculation.reqCarry }}</span></p>
                    </div>
                </div>

                <button @click="submit" :disabled="!side" class="w-full py-3 rounded-lg font-semibold text-white transition
                           disabled:opacity-40 disabled:cursor-not-allowed" :class="{
                            'bg-custom-green': side == 'BUY',
                            'bg-custom-red': side == 'SELL'
                        }">
                    {{ submitButtonText }}
                </button>
            </div>

        </div>
    </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '@/components/Modal.vue'
import { useTickerStore } from '@/stores/ticker'
import useWatchlistStore from '@/stores/watchlist'
import ButtonSwitch from '@/components/ButtonSwitch.vue'
import { useOrderStore } from '@/stores/orders'
import { useProfileStore } from '@/stores/profile'
import { useWalletStore } from '@/stores/wallet'
import { symbolSegment } from '@/utils/symbolsegment'
import { usePositionStore } from '@/stores/position'
import { calculatePnl } from '@/utils/pnl'

const watchlistStore = useWatchlistStore();
const tickerStore = useTickerStore();
const orderStore = useOrderStore();
const profileStore = useProfileStore();
const walletStore = useWalletStore()
const positionStore = usePositionStore()

const { wallet } = storeToRefs(walletStore)
const { profile } = storeToRefs(profileStore)
const { selectedScript, showOrderModal, activeSegment } = storeToRefs(watchlistStore)
const { selectedPosition, params } = storeToRefs(positionStore)

const emit = defineEmits(['update:modelValue'])

/* ---------- MODE DETECTION ---------- */
const isPositionMode = computed(() => selectedPosition.value !== null)

/* ---------- SIDE ---------- */
const side = ref('')

// Auto-set exit side when in position mode
const exitSide = computed(() => {
    if (!isPositionMode.value || !selectedPosition.value) return null
    return selectedPosition.value.side === 'BUY' ? 'SELL' : 'BUY'
})

watch([isPositionMode, exitSide], ([isPosMode, exit]) => {
    if (isPosMode && exit) {
        side.value = exit        // position exit → forced side
    } else {
        side.value = ''          // order mode → nothing selected
    }
}, { immediate: true })


/* ---------- CURRENT SCRIPT (from watchlist or position) ---------- */
const currentScript = computed(() => {
    if (isPositionMode.value && selectedPosition.value) {
        return {
            symbol: selectedPosition.value.symbol,
            segment: selectedPosition.value.segment,
            exchange: selectedPosition.value.exchange,
            instrument_token: selectedPosition.value.instrument_token,
            lot_size: 1, // Default, will be overridden if available
            expiry_date: selectedPosition.value.expiry_date || null,
            instrument_type: selectedPosition.value.instrument_type || selectedPosition.value.product_type
        }
    }
    return selectedScript.value
})

/* ---------- 🔑 TICKER KEY ---------- */
const tickerKey = computed(() => {
    if (!currentScript.value) return null

    return symbolSegment.includes(currentScript.value.segment)
        ? currentScript.value.symbol
        : currentScript.value.token
})

/* ---------- LIVE ---------- */
const tick = computed(() =>
    tickerKey.value
        ? tickerStore.getLastPrice(tickerKey.value) || {}
        : {}
)

const activeSegmentSettigs = computed(() => {
    return profile.value?.settings?.segment_settings[`${activeSegment.value}-${side.value}`]
})

const fundCalculation = computed(() => {
    const reqMargin = qty.value * (orderType.value == 'MARKET' ? live.value.ltp : price.value)
    return {
        reqMargin,
        availFunds: wallet.value?.balance,
        reqFunds: Number(reqMargin / activeSegmentSettigs.value?.intraday_leverage).toFixed(2),
        reqCarry: Number(reqMargin / activeSegmentSettigs.value?.holding_leverage).toFixed(2),
    }
})

const live = computed(() => ({
    ltp: tick.value.ltp ?? 0,
    bid: tick.value.bid ?? 0,
    ask: tick.value.ask ?? 0,
    open: tick.value.o ?? 0,
    high: tick.value.h ?? 0,
    low: tick.value.l ?? 0,
    close: tick.value.c ?? 0,
    change: tick.value.change ?? 0,
    changeP: tick.value.c
        ? ((tick.value.ltp - tick.value.c) / tick.value.c) * 100
        : 0
}))

/* ---------- PNL (Position Mode) ---------- */
const currentPnl = computed(() => {
    if (!isPositionMode.value || !selectedPosition.value) return 0
    return calculatePnl(selectedPosition.value, tickerStore)
})

const getPnlClass = pnl => {
    if (Number(pnl) > 0) return 'text-custom-green'
    if (Number(pnl) < 0) return 'text-custom-red'
    return 'text-custom-text'
}

/* ---------- COLORS ---------- */
const priceColor = computed(() =>
    live.value.change > 0 ? 'text-green-500' :
        live.value.change < 0 ? 'text-red-500' :
            'text-custom-grey'
)

const bidAskColor = v =>
    v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-white'

/* ---------- LOT / QTY ---------- */
const lotSize = computed(() => currentScript.value?.lot_size || 1)

const isLot = ref(true)
const lots = ref(lotSize.value === 1 ? 1 : 0.5)
const qty = ref(lotSize.value)

// Max quantity for position mode
const maxPositionQty = computed(() => {
    if (!isPositionMode.value || !selectedPosition.value) return Infinity
    return Math.abs(Number(selectedPosition.value.net_quantity))
})

const inputValue = computed({
    get: () => isLot.value ? lots.value : qty.value,
    set(v) {
        if (!v || v <= 0) return

        if (isLot.value) {
            const minLot = lotSize.value === 1 ? 1 : 0.5
            lots.value = Math.max(minLot, Number(v))
            qty.value = Math.round(lots.value * lotSize.value)
        } else {
            qty.value = Math.max(1, Math.round(v))

            // Enforce max in position mode
            if (isPositionMode.value && qty.value > maxPositionQty.value) {
                qty.value = maxPositionQty.value
            }

            lots.value = qty.value / lotSize.value
        }
    }
})

const toggleLot = () => isLot.value = !isLot.value

// Initialize qty from position when in position mode
watch(isPositionMode, (isPosMode) => {
    if (isPosMode && selectedPosition.value) {
        const posQty = Math.abs(Number(selectedPosition.value.net_quantity))
        qty.value = posQty
        lots.value = posQty / lotSize.value
    } else {
        // Reset to defaults
        lots.value = lotSize.value === 1 ? 1 : 0.5
        qty.value = lotSize.value
    }
}, { immediate: true })

/* ---------- ORDER ---------- */
const orderType = ref('MARKET')
const price = ref(0)

watch(orderType, v => {
    if (v === 'LIMIT') price.value = live.value.ltp
})

/* ---------- SL / TARGET ---------- */
const enableSLTP = ref(false)
const stoploss = ref(null)
const target = ref(null)

watch(enableSLTP, v => {
    if (!v) {
        stoploss.value = null
        target.value = null
    }
})

/* ---------- BUTTON STYLES ---------- */
const activeBtn = 'bg-custom-primary font-semibold px-4 text-white py-2 rounded-full'
const inactiveBtn = ' font-semibold px-4 text-custom-primary py-2 rounded-full'

const buyActive = 'bg-custom-green text-white font-semibold py-2 rounded-full'
const sellActive = 'bg-custom-red text-white font-semibold py-2 rounded-full'
const inactiveSide = ' text-custom-primary font-semibold py-2 rounded-full'

const submitButtonText = computed(() =>
    isPositionMode.value ? 'Exit Position' : 'Place Order'
)

/* ---------- ACTIONS ---------- */
const close = () => {
    side.value = ''
    stoploss.value = null;
    target.value = null;
    enableSLTP.value = false;
    showOrderModal.value = false
    selectedPosition.value = null // Reset position mode
}

const exitAll = async () => {
    const confirmed = confirm('Are you sure you want to exit this positions?')
    if (!confirmed) return

    sqoffPosition()
    close()
}

const sqoffPosition = async () => {

    const data = params.value.status == 'OPEN' ? selectedPosition.value.symbol : selectedPosition.value.id
    const payload = {
        mode: params.value.status == 'OPEN' ? 'symbols' : 'ids',
        ...(params.value.status == 'OPEN' && { symbols: [data] }),
        ...(params.value.status == 'ACTIVE' && { ids: [data] })
    }

    await positionStore.sqoffPosition(payload)
    positionStore.getPositions()
    walletStore.getWallet()
    positionStore.getOpenPositions()
}

const submit = async () => {
    if (!side.value) return



    // ORDER MODE: Place order
    const payload = {
        transaction_type: side.value,
        order_type: orderType.value,
        quantity: qty.value,
        lots: lots.value.toFixed(2),
        price: orderType.value === 'LIMIT' ? price.value : live.value.ltp,
        stoploss: enableSLTP.value ? stoploss.value : null,
        target: enableSLTP.value ? target.value : null,
        symbol: currentScript.value.symbol,
        instrument_token: currentScript.value.instrument_token,
        exchange: currentScript.value.exchange,
        product_type: 'MIS'
    }

    const res = await orderStore.placeOrders(payload)
    orderStore.getOrders()
    positionStore.params.status = 'OPEN'
    positionStore.params.page = 1
    positionStore.getPositions()

    if (res) close()
}
</script>