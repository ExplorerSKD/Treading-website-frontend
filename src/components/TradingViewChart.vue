<script setup>
import useWatchlistStore from '@/stores/watchlist';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

const container = ref(null);
const wathlistStore = useWatchlistStore();
const { selectedScript } = storeToRefs(wathlistStore);

const scriptToSearch = computed(() => {
  const s = selectedScript.value
  if (!s) return ''

  const {
    script: underlyingSymbol,
    instrument_type,
    exchange,
    expiry_date,
    strike,
    symbol
  } = s

  // ---------- CRYPTO ----------
  if (instrument_type === 'CRYPTO') {
    return `BINANCE:${symbol}`
  }

  // ---------- MT5 / COMEX spot ----------
  if (exchange === 'MT5' || instrument_type === 'COMEX') {
    return symbol
  }

  // ---------- OPTIONS ----------
  if (instrument_type === 'CE' || instrument_type === 'PE') {
    const date = new Date(expiry_date)

    const yy = String(date.getFullYear()).slice(2)
    const mon = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const dd = String(date.getDate()).padStart(2, '0')

    const optType = instrument_type === 'CE' ? 'C' : 'P'

    return `NSE:${underlyingSymbol}${yy}${mon}${dd}${optType}${Math.trunc(strike)}`
  }

  // ---------- FUTURES ----------
  if (instrument_type === 'FUT') {
    // Continuous futures (TradingView style)
    if (exchange === 'NFO') {
      return `NSE:${underlyingSymbol}1!`
    }

    if (exchange === 'MCX') {
      return `MCX:${underlyingSymbol}1!`
    }
  }

  // ---------- FALLBACK ----------
  return symbol || ''
})



const loadTradingViewWidget = () => {
  if (!container.value) return;

  // Remove the existing widget before appending a new one
  container.value.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.type = "text/javascript";
  script.async = true;
  script.innerHTML = `
{
  "autosize": true,
  "symbol": "${scriptToSearch.value || 'BINANCE:BTCUSDT'}",
  "interval": "D",
  "timezone": "Etc/UTC",
  "theme": "dark",
  "style": "1",
  "locale": "en",
  "allow_symbol_change": true,
  "support_host": "https://www.tradingview.com"
}`

  container.value.appendChild(script);
};

onMounted(() => {
  loadTradingViewWidget();
});

// Watch for symbol changes and reload the widget
watch(selectedScript, () => {
  loadTradingViewWidget();
});
</script>

<template>
  <div class="tradingview-widget-container" ref="container" style="height: 100%; width: 100%;">
    <div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%;"></div>
    <div class="tradingview-widget-copyright">
      <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
        <span class="blue-text">Track all markets on TradingView</span>
      </a>
    </div>
  </div>
</template>
