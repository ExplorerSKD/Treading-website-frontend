<template>
    <div class="px-4">
        <div class="sticky top-0 bg-white pb-2">

            <header class="bg-white py-4 flex items-center justify-between ">
                <div class="flex items-center gap-4">
                    <button @click="$router.push({ name: 'profile' })"
                        class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">

                        <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />

                    </button>
                    <h1 class="text-lg font-semibold text-custom-text">Wallet</h1>
                </div>
            </header>


        </div>
        <div class="bg-custom-primary rounded-2xl p-4 text-white text-[14px]">

            <div class="flex justify-between mb-6">
                <div class="min-w-35">
                    <div class="text-custom-grey text-[11px] mb-1">Ledger Balance</div>
                    <div class="text-[14px] font-semibold">
                        ₹{{ formatCurrency(Math.round(Number(wallet.balance || 0))) }}
                    </div>
                </div>

                <div class="min-w-35">
                    <div class="text-custom-grey text-[11px] mb-1">Available Margin</div>
                    <div class="text-[14px] font-semibold">
                        ₹{{ formatCurrency(Math.round(availableMargin)) }}
                    </div>
                </div>

            </div>

            <div class="flex justify-between mb-6">
                <div class="min-w-35">
                    <div class="text-custom-grey text-[11px] mb-1">Utilised Fund</div>
                    <div class="text-[14px] font-semibold">
                        ₹{{ formatCurrency(Math.round(utilizedFunds)) }}
                    </div>
                </div>

                <div class="min-w-35">
                    <div class="text-custom-grey text-[11px] mb-1">MTM</div>
                    <div class="text-[14px] font-semibold">
                        ₹{{
                            openPositions.length
                                ? formatCurrency(
                                    Math.round(
                                        Number(totalPnl || 0)
                                    )
                                )
                                : 0
                        }}
                    </div>
                </div>
            </div>
            <div class=" grid grid-cols-2 gap-4">
                <button @click="() => { showRequestModal = true; requestMode = 'deposit' }"
                    class="rounded-lg bg-white  py-2 text-custom-primary flex items-center justify-center text-[14px] gap-2 font-semibold cursor-pointer ">
                    <img src="/svg/arrow-dark.svg" alt="" class="w-3">
                    Add Funds
                </button>
                <button @click="() => { showRequestModal = true; requestMode = 'withdraw' }"
                    class="rounded-lg bg-white/10  py-2 text-white flex items-center justify-center gap-2 font-semibold text-[14px] cursor-pointer">
                    <img src="/svg/arrow-light.svg" alt="" class="w-3">
                    Withdrawal
                </button>
            </div>
        </div>
        <h1 class="text-[27.2px] font-bold my-4 text-custom-primary">
            Fund Analytics
        </h1>
        <div
            class="overflow-x-auto bg-white border-b no-scrollbar border-custom-border flex gap-2 items-center max-w-[90vw] my-4 mb-8">
            <button @click="transactionType = 'DEPOSIT'"
                :class="{ 'border-b-2  border-custom-primary text-custom-primary': transactionType == 'DEPOSIT', 'bg-white border-b-2 border-white text-custom-primary': transactionType != 'DEPOSIT' }"
                class=" flex-1 py-1 text-[14px] px-3">
                Deposit
            </button>
            <button @click="transactionType = 'WITHDRAWAL'"
                :class="{ 'border-b-2  border-custom-primary text-custom-primary': transactionType == 'WITHDRAWAL', 'bg-white border-b-2 border-white text-custom-primary': transactionType != 'WITHDRAWAL' }"
                class=" flex-1 py-1 text-[14px] px-3">
                Withdrawal
            </button>

        </div>
        <ProfileLedger />
        <RequestModal />

    </div>
</template>

<script setup>
import { usePositionStore } from '@/stores/position'
import { useProfileStore } from '@/stores/profile'
import { useTickerStore } from '@/stores/ticker'
import { useWalletStore } from '@/stores/wallet'
import { calculatePnl } from '@/utils/pnl'
import { symbolSegment } from '@/utils/symbolsegment'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import RequestModal from '../profile/RequestModal.vue'
import ProfileLedger from '../profile/ProfileLedger.vue'
import { useScriptSettingStore } from '@/stores/scriptsetting'
import useUserBankAccountStore from '@/stores/bank'

const walletStore = useWalletStore()
const positionStore = usePositionStore()
const tickerStore = useTickerStore()
const profileStore = useProfileStore()
const scriptSettingStore = useScriptSettingStore();
const userBankAccountStore = useUserBankAccountStore()

const { scriptSettings } = storeToRefs(scriptSettingStore)
const { profile } = storeToRefs(profileStore)
const { openPositions } = storeToRefs(positionStore)
const { wallet, showRequestModal, requestMode, transactionType } = storeToRefs(walletStore)

/* ================= FORMATTERS ================= */

const formatCurrency = (amount) => {
    const n = Number(amount) || 0

    // if (n >= 1_00_00_000) return formatShorthand(n)
    return new Intl.NumberFormat('en-IN').format(n)
}

/* ================= HELPERS ================= */

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

/* ================= COMPUTEDS ================= */


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


watch(transactionType, () => {
    walletStore.getTransactions()
})
</script>

<style scoped lang="scss"></style>
