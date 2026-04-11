<template>
    <Modal v-model="showOrderModal" @close="close">
        <div class="rounded-xl w-full mx-auto text-custom-text">
            <!-- HEADER -->
            <div v-if="side" class="flex items-center gap-4 p-2 justify-between">
                <button @click="side = ''" class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">
                    <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />
                </button>

                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-custom-grey">
                        Enable Stoploss & Target
                    </span>
                    <ButtonSwitch
                        @click="() => { if (orderType == 'LIMIT') useToastStore().addToast('Error', 'Cannot add SL-TP in limit orders', 'error') }"
                        v-model="enableSLTP" :disabled="orderType === 'LIMIT'" />
                </div>

            </div>
            <div class="border-b border-custom-border px-4 py-3">
                <div class="flex justify-between items-center">
                    <p class="text-base font-semibold">{{ currentScript?.symbol }}</p>
                    <span class="text-xs text-custom-grey">{{ currentScript?.expiry_date }}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                    <div>
                        <p class="text-xs text-custom-grey">
                            {{ currentScript?.segment }}
                        </p>
                        <div class="flex gap-3 text-xs mt-1">
                            <p :class="getBidClass(currentScript)" class="font-semibold">
                                Bid: {{ formatNumber(live.bid) || '-' }}
                            </p>
                            <p :class="getAskClass(currentScript)" class="font-semibold">
                                Ask: {{ formatNumber(live.ask) || '-' }}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-base font-semibold" :class="priceColor">
                            {{ side ? side == 'BUY' ? formatNumber(live.ask) : formatNumber(live.bid) :
                                formatNumber(live.ltp) }}
                        </p>
                        <p class="text-[12px]" :class="priceColor">
                            {{ formatNumber(live.change) }} ({{ formatNumber(live.changeP) }}%)
                        </p>
                    </div>
                </div>
            </div>

            <!-- OHLC -->
            <div class="flex justify-between px-2 py-1 text-[12px] text-custom-grey border-b border-custom-border">
                <div class="font-semibold">O: {{ formatNumber(live.open) }}</div>
                <div class="font-semibold">H: {{ formatNumber(live.high) }}</div>
                <div class="font-semibold">L: {{ formatNumber(live.low) }}</div>
                <div class="font-semibold">C: {{ formatNumber(live.close) }}</div>
            </div>

            <div v-if="activeSegmentSettings"
                class="flex justify-between px-2 py-1 text-[12px] bg-custom-border/30 rounded">
                <p class="font-semibold">Max Lot: {{ activeSegmentSettings.max_lot }}</p>
                <p class="font-semibold">Order Lot: {{ activeSegmentSettings.max_order_lot }}</p>
                <p class="font-semibold">Lot Size: {{ lotSize }}</p>
                <p class="font-semibold">
                    {{ isLot ? 'Qty' : 'Lots' }}: {{ isLot ? qty : lots?.toFixed(2) }}
                </p>
            </div>

            <!-- BODY -->
            <div class="p-4 space-y-3">
                <!-- BUY / SELL SELECT -->
                <div v-if="!side" class="grid grid-cols-2 gap-3 rounded-full">
                    <button @click="side = 'BUY'"
                        class="px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-150 border-custom-green"
                        :class="side === 'BUY' ? 'bg-custom-green text-white' : 'text-custom-green hover:bg-custom-green/10'">
                        BUY
                    </button>
                    <button @click="side = 'SELL'"
                        class="px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-150 border-custom-red"
                        :class="side === 'SELL' ? 'bg-custom-red text-white' : 'text-custom-red hover:bg-custom-red/10'">
                        SELL
                    </button>
                </div>

                <div v-if="side" class="space-y-3">
                    <!-- ORDER TYPE -->
                    <div class="flex text-[14px] justify-between border-b border-custom-border">
                        <button @click="orderType = 'MARKET'" :class="orderType === 'MARKET' ? activeBtn : inactiveBtn">
                            Market
                        </button>
                        <button @click="orderType = 'LIMIT'" :class="orderType === 'LIMIT' ? activeBtn : inactiveBtn">
                            Limit
                        </button>
                    </div>

                    <!-- PRICE + LOT/QTY -->
                    <div class="space-y-2">
                        <div>
                            <label class="text-xs font-semibold text-custom-grey">Price</label>
                            <input v-if="orderType == 'LIMIT'" type="number" v-model.number="price"
                                :placeholder="side == 'BUY' ? formatNumber(live.ask) : formatNumber(live.bid)"
                                class="p-4 border w-full border-custom-border rounded-md text-sm" />
                            <div v-else class="relative">
                                <input type="number" disabled :value="side == 'BUY' ? live.ask : live.bid"
                                    class="p-4 border w-full border-custom-border rounded-md text-sm opacity-50" />
                                <img src="/svg/lock.svg" class="absolute right-4 top-4 opacity-80 w-5" alt="">
                            </div>
                        </div>

                        <div class="relative">
                            <label class="text-xs font-semibold text-custom-grey">
                                {{ isLot ? 'Lots' : 'Quantity' }}
                            </label>
                            <input type="number" v-model="inputValue"
                                class="p-4 border w-full border-custom-border rounded-md text-sm" />
                            <button @click="toggleLot"
                                class="absolute top-9 right-2 bg-custom-primary rounded-full p-1">
                                <img src="/sync.svg" class="w-5 transition-transform" :class="{ 'rotate-90': isLot }" />
                            </button>
                        </div>
                    </div>

                    <!-- SL / TARGET -->
                    <div v-if="enableSLTP" class="grid grid-cols-2 gap-3">
                        <input type="number" v-model.number="stoploss" placeholder="Stoploss"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                        <input type="number" v-model.number="target" placeholder="Target"
                            class="p-4 border w-full border-custom-border rounded-md text-sm" />
                    </div>
                </div>
            </div>

            <!-- SUBMIT -->
            <div v-if="side" class="p-4 border-t border-custom-border">
                <!-- Calculation -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center justify-between w-full">
                        <p class="text-[12px]  font-semibold text-custom-grey">
                            Intraday : <span class="text-custom-text">{{ formatNumber(fundCalculation.reqFunds)
                            }}</span>
                        </p>
                        <p class="text-[12px] font-semibold text-custom-grey">
                            Carry : <span class="text-custom-text">{{ formatNumber(fundCalculation.reqCarry) }}</span>
                        </p>
                        <p class="text-[12px] font-semibold text-custom-grey">
                            Avail. Margin = <span class="text-custom-text">{{ formatNumber(availableMargin)
                            }}</span>
                        </p>
                    </div>
                </div>

                <button @click="submit" :disabled="!side || inputValue === '' || inputValue <= 0" class="w-full py-3 rounded-lg font-semibold text-white transition
         disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="{ 'bg-custom-green': side == 'BUY', 'bg-custom-red': side == 'SELL' }">
                    Place Order
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
import { usePositionStore } from '@/stores/position'
import { symbolSegment } from '@/utils/symbolsegment'
import { calculatePnl, formatNumber } from '@/utils/pnl'
import { useToastStore } from '@/stores/utils/toast'
import { useScriptSettingStore } from '@/stores/scriptsetting'

const toast = useToastStore()

const watchlistStore = useWatchlistStore()
const tickerStore = useTickerStore()
const orderStore = useOrderStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const positionStore = usePositionStore()
const scriptSettingStore = useScriptSettingStore()


const { scriptSettings } = storeToRefs(scriptSettingStore)
const { openPositions } = storeToRefs(positionStore)
const { wallet } = storeToRefs(walletStore)
const { profile } = storeToRefs(profileStore)
const { selectedScript, showOrderModal, activeSegment } = storeToRefs(watchlistStore)
const { openOrders } = storeToRefs(orderStore)


const alreadyOpenOrder = computed(() => openOrders.value.some(o => o.symbol == selectedScript.value.symbol))

const side = ref('')
const currentScript = computed(() => selectedScript.value)

const tickerKey = computed(() => {
    if (!currentScript.value) return null
    if (symbolSegment.includes(currentScript.value.segment)) return currentScript.value.symbol
    return currentScript.value.token
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

const priceColor = computed(() =>
    live.value.change > 0 ? 'text-custom-green' : live.value.change < 0 ? 'text-custom-red' : 'text-custom-grey'
)

const getBidClass = (item) => {
    if (!item) return ''
    const tick = tickerStore.getLastPrice(getTickerKey(item))
    if (!tick?.bid || !tick?.ltp) return ''
    return tick.bid >= tick.ltp ? 'text-custom-green' : 'text-custom-red'
}

const getAskClass = (item) => {
    if (!item) return ''
    const tick = tickerStore.getLastPrice(getTickerKey(item))
    if (!tick?.ask || !tick?.ltp) return ''
    return tick.ask <= tick.ltp ? 'text-custom-green' : 'text-custom-red'
}

const getTickerKey = (item) => {
    if (!item) return null
    return symbolSegment.includes(item.segment) ? item.symbol : item.token
}

const lotSize = computed(() => currentScript.value?.lot_size || 1)
const isLot = ref(true)
const lots = ref(1)
const qty = ref(1)


// Initialize qty based on lotSize when component mounts or script changes
watch([currentScript, lotSize], () => {
    if (lotSize.value) {
        lots.value = 1
        qty.value = lotSize.value
    }
}, { immediate: true })

const inputValue = computed({
    get() {
        return isLot.value ? lots.value : qty.value
    },
    set(v) {
        // allow empty input
        if (v === '' || v === null) {
            if (isLot.value) {
                lots.value = ''
            } else {
                qty.value = ''
            }
            return
        }

        const value = Number(v)
        if (Number.isNaN(value)) return

        if (isLot.value) {
            lots.value = value
            qty.value = Math.round(value * lotSize.value)
        } else {
            qty.value = Math.round(value)
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

const orderType = ref('MARKET')
const price = ref(0)

watch(orderType, v => {
    if (v === 'LIMIT') {
        price.value = side.value === 'BUY' ? live.value.ask : live.value.bid
    }
})

const enableSLTP = ref(false)
const stoploss = ref(null)
const target = ref(null)


const activeBtn = 'border-b-2 border-custom-primary text-custom-primary flex-1 py-2'
const inactiveBtn = 'bg-white border-b-2 border-white text-custom-primary flex-1 py-2'

const activeSegmentSettings = computed(() => {
    const segment = activeSegment.value
    const direction = side.value
    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(segment) && (s.scripts?.includes('ALL') || s.scripts?.includes(currentScript.value.script)))

    if (!segment || !direction || !profileSettings) return null

    const key = `${segment}-${direction}`

    const hasScriptOverride =
        script &&
        script.segments?.includes(segment) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(currentScript.value.script)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings[key] || null
})

const activeSegmentSettigs = (pos) => {
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
        const activeSegmentSetting = activeSegmentSettigs(pos);

        const reqMargin = pos.side == 'BUY' ? pos.buy_value : pos.sell_value
        const totalLots = pos.lots

        const leverage = ['CNC', 'NRML'].includes(pos.product_type) ?
            activeSegmentSetting?.holding_leverage : activeSegmentSetting?.intraday_leverage

        const type = ['CNC', 'NRML'].includes(pos.product_type) ? activeSegmentSetting?.holding_leverage_type : activeSegmentSetting?.intraday_leverage_type


        const calcFunds = (type, margin, leverage, lots) => {

            let result = margin

            if (type === 'multiplier') {
                result = margin / leverage
            }

            else if (type === 'fixed_leverage') {
                result = margin - leverage
            }

            else if (type === 'fixed') {
                result = lots * leverage
            }

            return Math.max(0, Number(result).toFixed(2))
        }
        sum += calcFunds(type, reqMargin, leverage, totalLots)
    })

    return sum
})


const fundCalculation = computed(() => {
    const currentPrice = orderType.value === 'MARKET' ? live.value.ltp : price.value

    const reqMargin = qty.value * currentPrice
    const lots = qty.value / lotSize.value

    const intradayLeverage = activeSegmentSettings.value?.intraday_leverage || 1
    const holdingLeverage = activeSegmentSettings.value?.holding_leverage || 1

    const intradayType = activeSegmentSettings.value?.intraday_leverage_type
    const holdingType = activeSegmentSettings.value?.holding_leverage_type

    const calcFunds = (type, margin, leverage, lots) => {


        if (type === 'fixed_leverage') {
            return Number(margin - leverage).toFixed(2)
        }

        else if (type === 'fixed') {
            return Number(lots * leverage).toFixed(2)
        }

        else return Number(margin / leverage).toFixed(2)

    }

    return {
        reqMargin,
        availFunds: (wallet.value?.balance || 0) - utilizedFunds.value,
        reqFunds: calcFunds(intradayType, reqMargin, intradayLeverage, lots),
        reqCarry: calcFunds(holdingType, reqMargin, holdingLeverage, lots),
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

const close = () => {
    resetForm()
    showOrderModal.value = false
}

const resetForm = () => {
    side.value = ''
    orderType.value = 'MARKET'
    price.value = 0

    isLot.value = true
    lots.value = 1
    qty.value = lotSize.value

    enableSLTP.value = false
    stoploss.value = null
    target.value = null
}

const submit = async () => {
    if (!side.value) return

    if (qty.value === '' || Number(qty.value) <= 0) {
        toast.addToast('Error', 'Quantity must be greater than zero', 'error')
        return
    }

    if (isLot.value && (lots.value === '' || Number(lots.value) <= 0)) {
        toast.addToast('Error', 'Lots must be greater than zero', 'error')
        return
    }

    if (isLot.value && (!lots.value || lots.value <= 0)) {
        toast.addToast('Error', 'Lots must be greater than zero', 'error')
        return
    }

    if (orderType.value === 'LIMIT' && (!price.value || price.value <= 0)) {
        toast.addToast('Error', 'Enter a valid limit price', 'error')
        return
    }

    const orderPrice = orderType.value === 'LIMIT' ? price.value : (side.value == 'BUY' ? live.value.ask : live.value.bid)

    const payload = {
        transaction_type: side.value,
        order_type: orderType.value,
        quantity: qty.value,
        lots: lots.value.toFixed(2),
        price: orderPrice,

        // 👇 optional fields
        stoploss: enableSLTP.value ? Number(stoploss.value) : undefined,
        target: enableSLTP.value ? Number(target.value) : undefined,
        symbol: currentScript.value.symbol,
        instrument_token: currentScript.value.token,
        exchange: currentScript.value.exchange,
        product_type: 'MIS',
        script: currentScript.value.script
    }

    if (orderType.value === 'LIMIT') {
        payload.stoploss = undefined
        payload.target = undefined
    }

    if ((payload.stoploss || payload.target) && alreadyOpenOrder.value) {
        useToastStore().addToast('Cannot place SLTP order', 'You have an open order blocking order placement. Please delete or modify open orders.', 'error');
        return;
    }

    const res = await orderStore.placeOrders(payload)
    orderStore.getOrders()
    walletStore.getWallet()
    positionStore.params.status = 'OPEN'
    positionStore.params.page = 1
    positionStore.getPositions()
    positionStore.getOpenPositions()

    if (res) close()
}


watch(orderType, (v) => {
    if (v === 'LIMIT') {
        // force disable SL/TP
        enableSLTP.value = false
        stoploss.value = null
        target.value = null
    }

    if (v === 'LIMIT') {
        price.value = side.value === 'BUY'
            ? live.value.ask
            : live.value.bid
    }
})
</script>