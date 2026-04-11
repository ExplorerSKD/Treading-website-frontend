<template>
    <div class="portfolio-card">
        <div class="portfolio-header">Portfolio</div>
        <div class="portfolio-stats">
            <div class="stat-col">
                <span class="stat-label">Invested</span>
                <span class="stat-val">₹{{ formatNumber(Math.round(utilizedFunds)) }}</span>
            </div>
            <div class="stat-col right">
                <span class="stat-label">Current</span>
                <span class="stat-val" :class="totalPnl >= 0 ? 'green' : 'red'">
                    ₹{{ formatNumber(Math.round(utilizedFunds + totalPnl)) }}
                </span>
            </div>
        </div>
        <div class="pnl-row">
            <span class="stat-label">Total PNL</span>
            <span class="stat-val" :class="totalPnl >= 0 ? 'green' : 'red'">
                <span v-if="totalPnl > 0">+</span>{{ formatNumber(Math.round(totalPnl)) }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { usePositionStore } from '@/stores/position';
import { useProfileStore } from '@/stores/profile';
import { useScriptSettingStore } from '@/stores/scriptsetting';
import { useTickerStore } from '@/stores/ticker';
import { useToastStore } from '@/stores/utils/toast';
import { useWalletStore } from '@/stores/wallet';
import { calculatePnl, formatNumber } from '@/utils/pnl';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';

const positionStore = usePositionStore();
const profileStore = useProfileStore();
const tickerStore = useTickerStore()
const walletStore = useWalletStore();
const scriptSettingStore = useScriptSettingStore();

const { scriptSettings } = storeToRefs(scriptSettingStore)
const { wallet } = storeToRefs(walletStore);
const { profile } = storeToRefs(profileStore)
const { openPositions } = storeToRefs(positionStore);


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

</script>

<style lang="scss" scoped></style>