<!-- <script setup lang="ts">
import TradingViewChart from '@/components/TradingViewChart.vue';

</script>

<template>
    <div class="h-screen ">
        <div class="flex items-center gap-2">
            <button @click="$router.back" class="text-black text-[14px] px-4">
                < </button>
                    <h1 class="text-[29.2px] font-medium text-custom-primary">
                        Chart
                    </h1>
        </div>
        <TradingViewChart />
    </div>
</template> -->

<template>
    <div ref="chartContainer" class="bg-black h-screen w-full">

    </div>
</template>

<script setup>
import { useTickerStore } from '@/stores/ticker';
import useWatchlistStore from '@/stores/watchlist';
import { rawData } from '@/utils/chartdata';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import { onMounted, ref, watchEffect } from 'vue';

const watchlistStore = useWatchlistStore()
const tickerStore = useTickerStore();
const chartOptions = { layout: { textColor: '#ececec', background: { type: 'solid', color: '#222222' } } };
const chartContainer = ref(null);
let chart;
let candlestickSeries;


// function toUnix(dateStr) {
//     const [day, month, year] = dateStr.split('-').map(Number)

//     // Set to END of day (23:59:59 local)
//     return Math.floor(
//         new Date(year, month - 1, day, 23, 59, 59).getTime() / 1000
//     )
// }

function formatDate(dateStr) {
    // input: "01-01-2026"
    const [day, month, year] = dateStr.split('-')

    return `${year}-${month}-${day}`
}



const candleData = [...rawData]  // clone
    .reverse()
    .map(row => ({
        time: formatDate(row[0]),
        open: Number(row[2].replace(/,/g, '')),
        high: Number(row[3].replace(/,/g, '')),
        low: Number(row[4].replace(/,/g, '')),
        close: Number(row[1].replace(/,/g, '')),
    }))



onMounted(() => {
    chart = createChart(chartContainer.value, chartOptions);
    candlestickSeries = chart.addSeries(CandlestickSeries)
    candlestickSeries.setData(candleData)
})

watchEffect(() => {
    const tick = tickerStore.getLastPrice('13238786')
    if (!tick || !candlestickSeries || !tick.time) return

    const open = Number(tick.o)
    const high = Number(tick.h)
    const low = Number(tick.l)
    const close = Number(tick.c)


    // Guard: never feed NaN to the chart
    if (
        Number.isNaN(open) ||
        Number.isNaN(high) ||
        Number.isNaN(low) ||
        Number.isNaN(close)
    ) return

    candlestickSeries.update({
        time: tick.time.slice(0, 10), // yyyy-mm-dd
        open,
        high,
        low,
        close,
    })
})




</script>

<style lang="scss" scoped></style>