<template>
    <Modal v-model="showPositionModal" @close="close">
        <div class="rounded-xl w-full mx-auto text-custom-text">

            <!-- HEADER -->
            <div v-if="actionMode" class="flex items-center gap-4 p-2 justify-between">
                <button @click="() => { actionMode = ''; qtyError = '' }"
                    class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">
                    <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />
                </button>

                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-custom-grey">
                        Enable Stoploss & Target
                    </span>
                    <ButtonSwitch v-model="enableSLTP" />
                </div>
            </div>

            <!-- SYMBOL HEADER -->
            <div class="border-b border-custom-border px-4 py-3">
                <div class="flex justify-between items-center">
                    <p class="text-base font-semibold">{{ position?.symbol }}</p>
                    <span class="text-xs text-custom-grey">{{ position?.expiry_date }}</span>
                </div>

                <div class="flex justify-between items-center mt-1">
                    <div>
                        <p class="text-xs text-custom-grey">
                            {{ position?.segment }} |
                            {{ position?.instrument_type || position?.product_type }}
                        </p>

                        <div class="flex gap-3 text-xs mt-1">
                            <p :class="getBidClass(position)" class="font-semibold">
                                Bid: {{ formatNumber(live.bid) || '-' }}
                            </p>
                            <p :class="getAskClass(position)" class="font-semibold">
                                Ask: {{ formatNumber(live.ask) || '-' }}
                            </p>
                        </div>
                    </div>

                    <div class="text-right">
                        <p class="text-base font-semibold" :class="priceColor">
                            {{ formatNumber(live.ltp) }}
                        </p>

                        <p class="text-[calc(12px*var(--font-scale))]" :class="priceColor">
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
            <div v-if="actionMode && activeSegmentSettings"
                class="flex justify-between px-2 py-1 text-[calc(12px*var(--font-scale))] bg-custom-border/30 rounded">

                <p class="font-semibold">Max Lot: {{ activeSegmentSettings.max_lot }}</p>
                <p class="font-semibold">Order Lot: {{ activeSegmentSettings.max_order_lot }}</p>
                <p class="font-semibold">Lot Size: {{ lotSize }}</p>

                <p class="font-semibold">
                    {{ isLot ? 'Qty' : 'Lots' }}:
                    {{ isLot ? qty : formatNumber(lots) }}
                </p>
            </div>

            <!-- POSITION INFO -->
            <div v-if="actionMode != 'ADD'" class="border-b border-custom-border px-4 py-3 bg-custom-border/30">

                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs text-custom-grey">Current P&L</p>

                        <p class="text-lg font-bold" :class="getPnlClass(currentPnl)">
                            <span v-if="currentPnl > 0">+</span>
                            {{ formatNumber(currentPnl) }}
                        </p>
                    </div>

                    <button @click="showConfirmationModal = true"
                        class="px-4 py-2 rounded-lg text-[calc(14px*var(--font-scale))] text-white bg-custom-red hover:bg-custom-red/90 transition">
                        Exit All
                    </button>
                </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="p-4 space-y-3">

                <div v-if="!actionMode" class="grid grid-cols-2 gap-3">

                    <button @click="actionMode = 'ADD'"
                        class="px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all" :class="actionMode === 'ADD'
                            ? (position?.side === 'BUY'
                                ? 'bg-custom-green text-white border-custom-green'
                                : 'bg-custom-red text-white border-custom-red')
                            : (position?.side === 'BUY'
                                ? 'text-custom-green border-custom-green hover:bg-custom-green/10'
                                : 'text-custom-red border-custom-red hover:bg-custom-red/10')">

                        Add More
                    </button>

                    <button @click="actionMode = 'EXIT'"
                        class="px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all" :class="actionMode === 'EXIT'
                            ? (position?.side === 'BUY'
                                ? 'bg-custom-red text-white border-custom-red'
                                : 'bg-custom-green text-white border-custom-green')
                            : (position?.side === 'BUY'
                                ? 'text-custom-red border-custom-red hover:bg-custom-red/10'
                                : 'text-custom-green border-custom-green hover:bg-custom-green/10')">

                        Partial Exit
                    </button>

                </div>

                <!-- FORM -->
                <div v-if="actionMode" class="grid grid-cols-2 gap-4">

                    <!-- QTY INPUT -->
                    <div class="relative">

                        <label class="text-xs font-semibold text-custom-grey">

                            {{ isLot ? 'Lots' : 'Quantity' }}

                            <span v-if="actionMode === 'EXIT'" class="text-custom-grey">
                                (Available {{ isLot ? 'Lots' : 'Quantity' }}:
                                {{ isLot ? formatNumber(maxPositionQty / lotSize) : formatNumber(maxPositionQty) }})
                            </span>

                        </label>

                        <input type="number" v-model="inputValue" class="px-3 py-4 border w-full rounded-md text-sm"
                            :class="qtyError ? 'border-custom-red' : 'border-custom-border'" />

                        <p v-if="qtyError" class="text-custom-red text-xs mt-1">
                            {{ qtyError }}
                        </p>

                        <button @click="toggleLot" class="absolute top-10 right-2 bg-custom-primary rounded-full p-1">
                            <img src="/sync.svg" class="w-4 transition-transform" :class="{ 'rotate-90': isLot }" />
                        </button>

                    </div>

                    <!-- SL / TARGET -->
                    <div v-if="enableSLTP" class="grid grid-cols-2 col-span-2 gap-3">

                        <div>
                            <label class="text-xs font-semibold text-custom-grey">
                                Stoploss
                            </label>

                            <input type="number" v-model.number="stoploss" placeholder="Stoploss"
                                class="p-4 border w-full border-custom-border rounded-md text-sm" />
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-custom-grey">
                                Target
                            </label>

                            <input type="number" v-model.number="target" placeholder="Target"
                                class="p-4 border w-full border-custom-border rounded-md text-sm" />

                        </div>

                    </div>

                </div>

            </div>

            <!-- MARGIN -->
            <div v-if="actionMode" class="p-4 border-t border-custom-border">

                <div v-if="actionMode == 'ADD'" class="flex items-center justify-between mb-4">

                    <div class="flex items-center justify-between w-full">

                        <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                            Intraday :
                            <span class="text-custom-text">
                                {{ formatNumber(fundCalculation.reqFunds) }}
                            </span>
                        </p>

                        <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                            Carry :
                            <span class="text-custom-text">
                                {{ formatNumber(fundCalculation.reqCarry) }}
                            </span>
                        </p>

                        <p class="text-[calc(12px*var(--font-scale))] font-semibold text-custom-grey">
                            Avail. Margin =
                            <span class="text-custom-text">
                                {{ formatNumber(availableMargin) }}
                            </span>
                        </p>

                    </div>

                </div>

                <button @click="submit" :disabled="!actionMode || !inputValue || inputValue == 0"
                    class="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="actionMode === 'EXIT'
                        ? (position?.side === 'BUY' ? 'bg-custom-red' : 'bg-custom-green')
                        : (position?.side === 'BUY' ? 'bg-custom-green' : 'bg-custom-red')">

                    {{ submitButtonText }}

                </button>

            </div>

        </div>
    </Modal>

    <ConfirmationModal v-model="showConfirmationModal" title="Square off position"
        message="Are you sure want to square off this positions." confirm-text="Square off" cancel-text="Cancel"
        @confirm="exitAll" @cancel="showConfirmationModal = false" />

</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '@/components/Modal.vue'
import { useTickerStore } from '@/stores/ticker'
import { useOrderStore } from '@/stores/orders'
import { useWalletStore } from '@/stores/wallet'
import { usePositionStore } from '@/stores/position'
import { calculatePnl, formatNumber } from '@/utils/pnl'
import { symbolSegment } from '@/utils/symbolsegment'
import { useProfileStore } from '@/stores/profile'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { makeRequest } from '@/request/requests'
import ButtonSwitch from '@/components/ButtonSwitch.vue'
import { useScriptSettingStore } from '@/stores/scriptsetting'
import { useToastStore } from '@/stores/utils/toast'

const tickerStore = useTickerStore()
const orderStore = useOrderStore()
const walletStore = useWalletStore()
const positionStore = usePositionStore()
const profileStore = useProfileStore()
const scriptSettingStore = useScriptSettingStore();


const { scriptSettings } = storeToRefs(scriptSettingStore)
const { profile } = storeToRefs(profileStore)
const { wallet } = storeToRefs(walletStore)
const { selectedPosition, params, openPositions } = storeToRefs(positionStore)
const { openOrders } = storeToRefs(orderStore);


// SL / TP
const enableSLTP = ref(false)
const stoploss = ref(null)
const target = ref(null)

watch(enableSLTP, v => {
    if (!v) {
        stoploss.value = null
        target.value = null
    }
})

const showPositionModal = ref(false)
const actionMode = ref('') // 'ADD' or 'EXIT'
const showConfirmationModal = ref(false)

const position = computed(() => selectedPosition.value)

const tickerKey = computed(() => {
    if (!position.value) return null
    if (symbolSegment.includes(position.value.segment)) return position.value.symbol
    return position.value.instrument_token
})

const tick = computed(() => tickerKey.value ? tickerStore.getLastPrice(tickerKey.value) || {} : {})

const live = computed(() => ({
    ltp: tick.value.ltp ?? 0,
    bid: tick.value.bid ?? 0,
    ask: tick.value.ask ?? 0,
    open: tick.value.o ?? 0,
    high: tick.value.h ?? 0,
    low: tick.value.l ?? 0,
    close: tick.value.c ?? 0,
    change: tick.value.change ?? 0,
    changeP: tick.value.c ? ((tick.value.ltp - tick.value.c) / tick.value.c) * 100 : 0
}))

const currentPnl = computed(() => {
    if (!position.value) return 0
    return calculatePnl(position.value, tickerStore)
})

const qtyError = ref('')

const isQtyValid = computed(() => {
    if (qty.value == '' || qty.value == null) return false
    if (Number(qty.value) <= 0) return false
    return true
})


const getPnlClass = pnl => {
    if (Number(pnl) > 0) return 'text-custom-green'
    if (Number(pnl) < 0) return 'text-custom-red'
    return 'text-custom-text'
}

const priceColor = computed(() =>
    live.value.change > 0 ? 'text-green-500' : live.value.change < 0 ? 'text-custom-red' : 'text-custom-grey'
)

const getBidClass = (item) => {
    const tick = tickerStore.getLastPrice(tickerKey.value)
    if (!tick?.bid || !tick?.ltp) return ''
    return tick.bid >= tick.ltp ? 'text-custom-green' : 'text-custom-red'
}

const getAskClass = (item) => {
    const tick = tickerStore.getLastPrice(tickerKey.value)
    if (!tick?.ask || !tick?.ltp) return ''
    return tick.ask <= tick.ltp ? 'text-custom-green' : 'text-custom-red'
}

// Lot/Qty management
const lotSize = ref(1)
watch(
    () => position.value?.symbol,
    async (symbol) => {
        if (!symbol) {
            lotSize.value = 1
            return
        }

        const res = await makeRequest(
            'instruments',
            'GET',
            {},
            {},
            { q: symbol },
            'search'
        )

        lotSize.value = res?.data?.[0]?.lot_size || 1
    },
    { immediate: true }
)

const isLot = ref(true)
const lots = ref(1)
const qty = ref(1)

// Initialize qty based on lotSize when position changes
watch([position, lotSize], () => {
    if (lotSize.value) {
        lots.value = 1
        qty.value = lotSize.value
    }
}, { immediate: true });

const openQuantities = computed(() => {
    const orders = openOrders.value.filter(o =>
        o.symbol == position.value?.symbol &&
        o.transaction_type === (position.value?.side == 'BUY' ? 'SELL' : 'BUY')
    )
    let sum = 0;
    orders.forEach(o => sum += o.quantity)

    return sum;
})


// const maxPositionQty = computed(() => Math.abs(Math.abs(Number(position.value?.net_quantity || 0)) - openQuantities.value))


const maxPositionQty = computed(() => {
    const qty = Math.abs(Number(position.value?.net_quantity || 0)) - openQuantities.value;
    return qty > 0 ? qty : 0;
})

const inputValue = computed({
    get() {
        return isLot.value ? lots.value : qty.value
    },
    set(v) {
        // Allow empty/clearing the input
        if (v === '' || v === null || v === undefined) {
            if (isLot.value) {
                lots.value = ''
            } else {
                qty.value = ''
            }
            return
        }

        const numValue = Number(v)

        // Allow temporary invalid values while typing
        if (numValue <= 0 || Number.isNaN(numValue)) {
            if (isLot.value) {
                lots.value = v
            } else {
                qty.value = v
            }
            return
        }

        if (isLot.value) {
            lots.value = numValue
            qty.value = Math.round(numValue * lotSize.value)
        } else {
            qty.value = Math.round(numValue)
            lots.value = qty.value / lotSize.value
        }
    }
})


const toggleLot = () => {
    if (isLot.value) {
        // switching to quantity
        qty.value = Math.round(lots.value * lotSize.value)
    } else {
        // switching to lots
        lots.value = qty.value / lotSize.value
    }
    isLot.value = !isLot.value
}

// Order type
const orderType = ref('MARKET')
const price = ref(0)

watch(orderType, v => {
    if (v === 'LIMIT') price.value = live.value.ltp
})

const activeBtn = 'border-b-2 border-custom-primary text-custom-primary flex-1 py-2'
const inactiveBtn = 'bg-white border-b-2 border-white text-custom-primary flex-1 py-2'

const submitButtonText = computed(() => {
    if (!actionMode.value) return 'Select Action'
    return actionMode.value === 'ADD' ? 'Add' : 'Exit Position'
})

const activeSegmentSettings = computed(() => {
    const segment = position.value?.segment
    const direction = position.value?.side
    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(segment) && (s.scripts?.includes('ALL') || s.scripts?.includes(position.value?.symbol)))

    if (!segment || !direction || !profileSettings) return null

    const key = `${segment}-${direction}`

    const hasScriptOverride =
        script &&
        script.segments?.includes(segment) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(position.value?.script)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings[key] || null
})

const getActiveSegment = (pos) => {
    if (!pos?.segment || !pos?.side) return null

    const key = `${pos.segment}-${pos.side}`

    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(pos.segment) && (s.scripts?.includes('ALL') || s.scripts?.includes(pos.script)))

    const hasScriptOverride =
        script &&
        script.segments?.includes(pos.segment) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(pos.script)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings?.[key] || null
}



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

const fundCalculation = computed(() => {

    const currentPrice =
        orderType.value === 'MARKET'
            ? live.value.ltp
            : price.value || live.value.ltp

    const reqMargin = qty.value * currentPrice
    const totalLots = qty.value

    const intradayLeverage =
        activeSegmentSettings.value?.intraday_leverage || 1

    const holdingLeverage =
        activeSegmentSettings.value?.holding_leverage || 1

    const intradayType =
        activeSegmentSettings.value?.intraday_leverage_type

    const holdingType =
        activeSegmentSettings.value?.holding_leverage_type


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

        availFunds:
            (wallet.value?.balance || 0) - utilizedFunds.value,

        reqFunds:
            calcFunds(
                intradayType,
                reqMargin,
                intradayLeverage,
                totalLots
            ),

        reqCarry:
            calcFunds(
                holdingType,
                reqMargin,
                holdingLeverage,
                totalLots
            )
    }
})

const close = () => {
    actionMode.value = ''
    orderType.value = 'MARKET'
    qtyError.value = ''
    enableSLTP.value = false
    stoploss.value = null
    target.value = null

    showPositionModal.value = false
    selectedPosition.value = null
}


const exitAll = async () => {
    const data = params.value.status == 'OPEN' ? position.value.symbol : position.value.id
    const payload = {
        mode: params.value.status == 'OPEN' ? 'symbols' : 'ids',
        ...(params.value.status == 'OPEN' && { symbols: [data] }),
        ...(params.value.status == 'ACTIVE' && { ids: [data] })
    }

    await positionStore.sqoffPosition(payload)
    await refreshData()
    close()
}

const submit = async () => {
    qtyError.value = ''

    if (!isQtyValid.value) {
        qtyError.value = 'Please enter a valid quantity'
        return
    }

    if (qty.value > maxPositionQty.value && actionMode.value == 'EXIT') {
        qtyError.value = 'Entered quantity is greater than available quantity.'

        if (openQuantities.value > 0) {
            useToastStore().addToast('Cannot exit quantity', 'You have an open exit order blocking part of this position. Please delete or modify open orders.', 'error');

        } else {

            useToastStore().addToast('Invalid exit quantity', 'The entered quantity exceeds the available position quantity.', 'error');
        }
        return;
    }



    if (actionMode.value === 'EXIT') {
        await exitPosition()
    } else {
        await addToPosition()
    }
}

const alreadyOpenOrder = computed(() => openOrders.value.some(o => o.symbol == position.value.symbol))


const exitPosition = async () => {
    const hasSL = enableSLTP.value && Number(stoploss.value) > 0
    const hasTarget = enableSLTP.value && Number(target.value) > 0

    let orderType = 'MARKET'
    const payload = {
        symbol: position.value.symbol,
        quantity: qty.value,
        lots: Number(lots.value),
        transaction_type: position.value.side === 'BUY' ? 'SELL' : 'BUY',
        product_type: position.value.product_type,
    }



    // CASE 1: nothing entered → MARKET
    if (!hasSL && !hasTarget) {
        orderType = 'MARKET'
    }

    // CASE 2: only SL → SL-M
    else if (hasSL && !hasTarget) {
        orderType = 'SL-M'
        payload.trigger_price = Number(stoploss.value)
    }

    // CASE 3: only Target → LIMIT
    else if (!hasSL && hasTarget) {
        orderType = 'LIMIT'
        payload.price = Number(target.value)
    }

    // CASE 4: SL + Target → LIMIT
    else if (hasSL && hasTarget) {
        orderType = 'LIMIT'
        payload.price = Number(target.value)
        payload.stoploss = Number(stoploss.value)
    }

    payload.order_type = orderType


    if ((hasSL || hasTarget) && alreadyOpenOrder.value) {
        useToastStore().addToast('Cannot place SLTP order', 'You have an open order blocking order placement. Please delete or modify open orders.', 'error');
        return;
    }

    const res = await orderStore.placeOrders(payload)
    if (res) {
        await refreshData()
        close()
    }
}

const addToPosition = async () => {
    const hasSL = enableSLTP.value && Number(stoploss.value) > 0
    const hasTarget = enableSLTP.value && Number(target.value) > 0

    // 🔒 Block if SL/TP enabled AND open order exists
    if ((hasSL || hasTarget) && alreadyOpenOrder.value) {
        useToastStore().addToast(
            'Cannot place SLTP order',
            'You have an open order blocking order placement. Please delete or modify open orders.',
            'error'
        )
        return
    }

    const payload = {
        transaction_type: position.value.side,
        order_type: orderType.value,
        quantity: qty.value,
        lots: lots.value.toFixed(2),
        price: orderType.value === 'LIMIT' ? price.value : live.value.ltp,
        symbol: position.value.symbol,
        instrument_token: position.value.instrument_token,
        exchange: position.value.exchange,
        product_type: position.value.product_type,
        script: position.value.script || ''
    }

    // ✅ Only attach SL if valid
    if (hasSL) {
        payload.stoploss = Number(stoploss.value)
    }

    // ✅ Only attach Target if valid
    if (hasTarget) {
        payload.target = Number(target.value)
    }

    const res = await orderStore.placeOrders(payload)
    if (res) {
        await refreshData()
        close()
    }
}



const refreshData = async () => {
    params.value.status == 'OPEN'
    positionStore.params.page = 1
    orderStore.getOrders()
    positionStore.getPositions()
    walletStore.getWallet()
    positionStore.getOpenPositions()
}

// Watch for position selection to open modal
watch(() => selectedPosition.value, (pos) => {
    if (pos) {
        showPositionModal.value = true
        // Reset to default qty
        lots.value = 1
        qty.value = lotSize.value
        orderType.value = 'MARKET'
    }
})

const totalPnl = computed(() => {
    let sum = 0
    openPositions.value.forEach(pos => {
        sum += Number(calculatePnl(pos, tickerStore) || 0)
    })
    return sum
})

const availableMargin = computed(() => {
    const balance = Number(wallet.value.balance || 0)

    return balance - utilizedFunds.value + (totalPnl.value >= 0 ? 0 : totalPnl.value)
})

</script>