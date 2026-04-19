<template>
  <div class="portfolio-card">
    <div class="portfolio-title">Portfolio</div>

    <!-- Ledger Balance & Available Margin row -->
    <div class="portfolio-stats" style="margin-bottom: 16px;">
      <div class="stat-group">
        <span class="stat-label">Ledger Balance</span>
        <span class="stat-val">₹{{ formatNumber(Math.round(Number(wallet.balance || 0))) }}</span>
      </div>
      <div class="stat-group right">
        <span class="stat-label">Available Margin</span>
        <span class="stat-val">₹{{ formatNumber(Math.round(availableMargin)) }}</span>
      </div>
    </div>

    <!-- Invested & Current row -->
    <div class="portfolio-stats">
      <div class="stat-group">
        <span class="stat-label">Invested</span>
        <span class="stat-val">₹{{ formatNumber(Math.round(utilizedFunds)) }}</span>
      </div>
      <div class="stat-group right">
        <span class="stat-label">Current</span>
        <span class="stat-val" :class="totalPnl >= 0 ? 'green' : 'red'">
          ₹{{ formatNumber(Math.round(utilizedFunds + totalPnl)) }}
        </span>
      </div>
    </div>

    <div class="portfolio-bottom">
      <span class="stat-label">Total PNL</span>
      <span class="stat-val" :class="totalPnl >= 0 ? 'green' : 'red'" style="font-size: calc(1.25rem * var(--font-scale));">
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

const availableMargin = computed(() => {
    const balance = Number(wallet.value.balance || 0)
    return balance - utilizedFunds.value + (totalPnl.value >= 0 ? 0 : totalPnl.value)
})


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.portfolio-card {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--container-bg, #FFFFFF);
  border: 1px solid var(--border-light, #E5E7EB);
  border-radius: 30px; padding: 24px; margin-bottom: 24px;
  cursor: pointer; box-shadow: var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.04));
  position: relative; overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
[data-theme="dark"] .portfolio-card,
:global(body.dark) .portfolio-card { 
  background: #0f212e; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
}

.portfolio-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--brand-dark-green, #1F4529); opacity: 0.8;
}
:global(body.dark) .portfolio-card::before { background: #10B981; }

.portfolio-card:active { transform: scale(0.98); box-shadow: var(--shadow-soft, 0 12px 32px rgba(0, 0, 0, 0.08)); }
.portfolio-title { font-size: calc(1.25rem * var(--font-scale)); font-weight: 800; color: var(--text-main, #1F4529); margin-bottom: 24px; letter-spacing: 0.5px; text-transform: uppercase; }
:global(body.dark) .portfolio-title { color: #10B981; }

.portfolio-stats { display: flex; justify-content: space-between; margin-bottom: 28px; gap: 4px; }
.stat-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.stat-group.right { align-items: flex-end; }
.stat-label { font-size: clamp(0.7rem, 3vw, 0.78rem); font-weight: 600; color: var(--text-sub, #64748B); white-space: nowrap; }
:global(body.dark) .stat-label { color: #9AA4BF; }

.stat-val { font-size: clamp(0.85rem, 3.8vw, 1.05rem); font-weight: 800; color: var(--text-main, #0F172A); letter-spacing: 0px; white-space: nowrap; }
:global(body.dark) .stat-val { color: #E8EAED; }
.stat-val.green { color: #10B981; }
.stat-val.red { color: #DC2626; }

.portfolio-bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16px; border-top: 1px dashed var(--border-light, #E5E7EB);
}
:global(body.dark) .portfolio-bottom { border-color: rgba(255, 255, 255, 0.12); }
</style>