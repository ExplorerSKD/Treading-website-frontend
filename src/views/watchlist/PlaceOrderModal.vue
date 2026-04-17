<template>
    <Modal v-model="showOrderModal" @close="close">
        <div class="w-full mx-auto text-[#1A1E2B] dark:text-[#E8EAED] rounded-[24px] overflow-hidden bg-white dark:bg-[#1A1F2D]" 
             style="font-family: 'Inter', sans-serif;">
            
            <!-- HEADER: Back + SL/TP -->
            <div v-if="side" class="flex items-center justify-between p-4 pb-2">
                <button @click="close" class="w-10 h-10 rounded-full bg-[#F3F5F9] dark:bg-[#252B3B] flex items-center justify-center text-[#5B677E] dark:text-[#E8EAED] transition-transform active:scale-95">
                    <i class="fas fa-chevron-left text-[14px]"></i>
                </button>

                <div class="flex items-center gap-3">
                    <span class="text-[13px] font-semibold text-[#8C94A8] dark:text-[#9AA4BF]">
                        Enable Stoploss & Target
                    </span>
                    <ButtonSwitch
                        @click="() => { if (orderType == 'LIMIT') useToastStore().addToast('Error', 'Cannot add SL-TP in limit orders', 'error') }"
                        v-model="enableSLTP" :disabled="orderType === 'LIMIT'" />
                </div>
            </div>

            <!-- SCRIPT INFO SECTION -->
            <div class="px-5 pt-2 pb-3">
                <div class="flex justify-between items-baseline mb-1">
                    <h2 class="text-[17px] font-bold tracking-tight text-[#1A1E2B] dark:text-white">{{ currentScript?.symbol }}</h2>
                    <span class="text-[12px] font-medium text-[#8C94A8]">{{ currentScript?.expiry_date }}</span>
                </div>
                
                <div class="flex justify-between items-end mb-1">
                    <div class="flex flex-col gap-1">
                        <span class="text-[11px] font-bold text-[#8C94A8] uppercase">{{ currentScript?.segment }}</span>
                        <div class="flex gap-3 text-[13px] font-semibold mt-0.5">
                            <span :class="getBidClass(currentScript)">Bid: {{ formatNumber(live.bid) || '-' }}</span>
                            <span :class="getAskClass(currentScript)">Ask: {{ formatNumber(live.ask) || '-' }}</span>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <div class="text-[20px] font-bold leading-none mb-1 text-custom-green" :class="priceColor">
                            {{ side ? (side == 'BUY' ? formatNumber(live.ask) : formatNumber(live.bid)) : formatNumber(live.ltp) }}
                        </div>
                        <div class="text-[12px] font-semibold text-custom-green" :class="priceColor">
                            {{ formatNumber(live.change) }} ({{ formatNumber(live.changeP) }}%)
                        </div>
                    </div>
                </div>
            </div>




            <!-- MAX LOTS INFO -->
            <div v-if="activeSegmentSettings" class="flex justify-between px-5 py-3 text-[11.5px] font-bold text-[#1A1E2B] dark:text-[#E8EAED]">
                <div>Max Lot: {{ activeSegmentSettings.max_lot }}</div>
                <div>Order Lot: {{ activeSegmentSettings.max_order_lot }}</div>
                <div>Lot Size: {{ lotSize }}</div>
                <div>{{ isLot ? 'Qty' : 'Lots' }}: {{ isLot ? qty : lots?.toFixed(2) }}</div>
            </div>

            <div class="h-[1px] w-full bg-[#F0F2F8] dark:bg-[#2A3143]"></div>

            <div class="px-5 py-4">
                <!-- BUY / SELL SELECT (ONLY SHOWN IF NO SIDE SELECTED) -->
                <div v-if="!side" class="grid grid-cols-2 gap-4">
                    <button @click="side = 'BUY'" class="py-3.5 rounded-xl border border-custom-green text-custom-green font-bold text-[14px] transition-all hover:bg-custom-green/10">
                        BUY
                    </button>
                    <button @click="side = 'SELL'" class="py-3.5 rounded-xl border border-custom-red text-custom-red font-bold text-[14px] transition-all hover:bg-custom-red/10">
                        SELL
                    </button>
                </div>
                
                <div v-if="side" class="space-y-5">
                    <!-- ORDER TYPE TABS (MARKET / LIMIT) -->
                    <div class="flex text-[15px] font-bold relative">
                        <button @click="orderType = 'MARKET'" 
                                class="flex-1 pb-3 transition-colors duration-200"
                                :class="orderType === 'MARKET' ? 'text-[#1A1E2B] dark:text-white' : 'text-[#8C94A8] dark:text-[#5B677E]'">
                            Market
                        </button>
                        <button @click="orderType = 'LIMIT'" 
                                class="flex-1 pb-3 transition-colors duration-200"
                                :class="orderType === 'LIMIT' ? 'text-[#1A1E2B] dark:text-white' : 'text-[#8C94A8] dark:text-[#5B677E]'">
                            Limit
                        </button>
                        <!-- Active Indicator -->
                        <div class="absolute bottom-0 h-[2px] bg-[#1A1E2B] dark:bg-white transition-all duration-300"
                             :style="{ width: '50%', left: orderType === 'MARKET' ? '0%' : '50%' }"></div>
                        <!-- Track Line -->
                        <div class="absolute bottom-0 left-0 w-full h-[1px] bg-[#F0F2F8] dark:bg-[#2A3143] z-[-1]"></div>
                    </div>

                    <!-- INPUT FIELDS -->
                    <div class="space-y-4">
                        <div class="relative">
                            <label class="block text-[12px] font-bold text-[#8C94A8] mb-1.5 ml-1">Price</label>
                            <input v-if="orderType == 'LIMIT'" type="number" v-model.number="price"
                                :placeholder="side == 'BUY' ? formatNumber(live.ask) : formatNumber(live.bid)"
                                class="w-full bg-[#Fbfbfc] dark:bg-[#1A1F2D] border border-[#F0F2F8] dark:border-[#2A3143] rounded-xl p-3.5 text-[15px] font-semibold text-[#1A1E2B] dark:text-white focus:outline-none focus:border-[#1A1E2B] dark:focus:border-white transition-colors" />
                            <div v-else class="relative">
                                <input type="number" disabled :value="side == 'BUY' ? live.ask : live.bid"
                                    class="w-full bg-[#Fbfbfc] dark:bg-[#1A1F2D] border border-[#F0F2F8] dark:border-[#2A3143] rounded-xl p-3.5 text-[15px] font-semibold text-[#1A1E2B] dark:text-white opacity-60" />
                                <i class="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5568]"></i>
                            </div>
                        </div>

                        <div class="relative">
                            <label class="block text-[12px] font-bold text-[#8C94A8] mb-1.5 ml-1">
                                {{ isLot ? 'Lots' : 'Quantity' }}
                            </label>
                            <input type="number" v-model="inputValue"
                                class="w-full bg-[#Fbfbfc] dark:bg-[#1A1F2D] border border-[#F0F2F8] dark:border-[#2A3143] rounded-xl p-3.5 pr-12 text-[15px] font-semibold text-[#1A1E2B] dark:text-white focus:outline-none focus:border-[#1A1E2B] dark:focus:border-white transition-colors" />
                            <button @click="toggleLot"
                                class="absolute bottom-[7px] right-[8px] w-[35px] h-[35px] bg-[#010A18] dark:bg-[#E8EAED] rounded-full flex items-center justify-center text-white dark:text-[#010A18] shadow-sm transform transition-transform active:scale-95">
                                <img src="/sync.svg" class="w-4 h-4 transition-transform filter dark:invert" :class="{ 'rotate-180': isLot }" />
                            </button>
                        </div>
                    </div>

                    <!-- SL / TARGET -->
                    <div v-if="enableSLTP" class="grid grid-cols-2 gap-3 pt-2">
                        <div>
                            <label class="block text-[12px] font-bold text-[#8C94A8] mb-1.5 ml-1">Stoploss</label>
                            <input type="number" v-model.number="stoploss" placeholder="0.00"
                                class="w-full bg-[#Fbfbfc] dark:bg-[#1A1F2D] border border-[#F0F2F8] dark:border-[#2A3143] rounded-xl p-3.5 text-[15px] font-semibold text-[#1A1E2B] dark:text-white focus:outline-none focus:border-[#1A1E2B] dark:focus:border-white transition-colors" />
                        </div>
                        <div>
                           <label class="block text-[12px] font-bold text-[#8C94A8] mb-1.5 ml-1">Target</label>
                           <input type="number" v-model.number="target" placeholder="0.00"
                                class="w-full bg-[#Fbfbfc] dark:bg-[#1A1F2D] border border-[#F0F2F8] dark:border-[#2A3143] rounded-xl p-3.5 text-[15px] font-semibold text-[#1A1E2B] dark:text-white focus:outline-none focus:border-[#1A1E2B] dark:focus:border-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOTTOM FOOTER -->
            <div v-if="side" class="px-5 pt-4 pb-5 border-t border-[#F0F2F8] dark:border-[#2A3143]">
                <!-- Calculation Info -->
                <div class="flex justify-between items-center mb-5 text-[12px]">
                    <div class="flex flex-col gap-1">
                        <span class="font-bold text-[#8C94A8]">Intraday :</span>
                        <span class="font-bold text-[#1A1E2B] dark:text-[#E8EAED]">{{ formatNumber(fundCalculation.reqFunds) }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="font-bold text-[#8C94A8]">Carry :</span>
                        <span class="font-bold text-[#1A1E2B] dark:text-[#E8EAED]">{{ formatNumber(fundCalculation.reqCarry) }}</span>
                    </div>
                    <div class="flex flex-col gap-1 items-end">
                        <span class="font-bold text-[#8C94A8]">Avail. Margin =</span>
                        <span class="font-bold text-[#1A1E2B] dark:text-[#E8EAED]">{{ formatNumber(availableMargin) }}</span>
                    </div>
                </div>

                <button @click="submit" :disabled="!side || inputValue === '' || inputValue <= 0" 
                    class="w-full py-3.5 rounded-lg font-bold text-white text-[16px] transition-all duration-200 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    :class="side == 'BUY' ? 'bg-custom-green' : 'bg-custom-red'"
                >
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
const { selectedScript, showOrderModal, activeSegment, selectedSide } = storeToRefs(watchlistStore)
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
    watchlistStore.selectedSide = ''
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

    if (res) {
        watchlistStore.orderPlaced = true;
        close();
    }
}

watch(showOrderModal, (isOpen) => {
    if (isOpen) {
        // Automatically jump to the order form if a side was selected
        side.value = selectedSide.value || ''
    }
})

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