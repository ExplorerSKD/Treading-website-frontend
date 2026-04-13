<template>
    <div class="px-4 pb-10">
        <div class="sticky top-0 bg-white z-10">
            <header class="py-4 flex items-center gap-4">
                <button @click="$router.push({ name: 'profile' })"
                    class="rounded-full w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all active:scale-95">
                    <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />
                </button>
                <h1 class="text-xl font-bold text-custom-primary">Wallet</h1>
            </header>
        </div>

        <!-- Balance Card -->
        <div class="bg-custom-primary rounded-[2rem] p-6 text-white shadow-xl shadow-black/10">
            <div class="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                    <p class="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Ledger Balance</p>
                    <p class="text-lg font-bold">
                        ₹{{ formatCurrency(Math.round(Number(wallet.balance || 0))) }}
                    </p>
                </div>

                <div>
                    <p class="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Available Margin</p>
                    <p class="text-lg font-bold">
                        ₹{{ formatCurrency(Math.round(availableMargin)) }}
                    </p>
                </div>

                <div>
                    <p class="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Utilised Fund</p>
                    <p class="text-lg font-bold">
                        ₹{{ formatCurrency(Math.round(utilizedFunds)) }}
                    </p>
                </div>

                <div>
                    <p class="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">MTM (P&L)</p>
                    <p class="text-lg font-bold" :class="{ 'text-green-400': totalPnl > 0, 'text-red-400': totalPnl < 0 }">
                        ₹{{ formatCurrency(Math.round(totalPnl || 0)) }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button @click="() => { showRequestModal = true; requestMode = 'deposit' }"
                    class="rounded-2xl bg-white py-4 text-custom-primary flex items-center justify-center text-sm gap-2 font-bold shadow-lg transition-all active:scale-95">
                    <img src="/svg/arrow-dark.svg" alt="" class="w-3">
                    Add Funds
                </button>
                <button @click="() => { showRequestModal = true; requestMode = 'withdraw' }"
                    class="rounded-2xl bg-white/10 py-4 text-white flex items-center justify-center gap-2 font-bold text-sm border border-white/10 transition-all active:scale-95">
                    <img src="/svg/arrow-light.svg" alt="" class="w-3">
                    Withdrawal
                </button>
            </div>
        </div>

        <div class="mt-10 mb-6">
            <h2 class="text-2xl font-bold text-custom-primary mb-1">Fund Analytics</h2>
            <p class="text-sm text-gray-500 font-medium">Track your deposit and withdrawal history</p>
        </div>

        <!-- Custom Tabs -->
        <div class="bg-gray-100 p-1.5 rounded-2xl flex items-center mb-8 border border-gray-200/50">
            <button @click="transactionType = 'DEPOSIT'"
                class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200"
                :class="transactionType == 'DEPOSIT' ? 'bg-white text-custom-primary shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'">
                Deposits
            </button>
            <button @click="transactionType = 'WITHDRAWAL'"
                class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200"
                :class="transactionType == 'WITHDRAWAL' ? 'bg-white text-custom-primary shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'">
                Withdrawals
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
