<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <div class="sticky top-0 bg-white z-40">

      <header class="bg-white px-4 py-4 flex items-center justify-between ">
        <div class="flex items-center gap-4">
          <button @click="() => { $router.push({ name: 'watchlist' }); searchedInstruments = [] }"
            class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">

            <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />

          </button>
          <h1 class="text-lg font-semibold text-custom-text">Add Instruments</h1>
        </div>
      </header>

    </div>
    <!-- Search Bar -->
    <div class="px-4 py-4 bg-white border-b border-custom-border text-custom-grey">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-custom-grey" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="2" />
        </svg>
        <input v-model="searchQueryInput" type="text" placeholder="Search instruments..."
          class="w-full pl-10 pr-4 py-3 border border-custom-border rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
      </div>
    </div>


    <div v-if="loading">
      <LoaderComponent :show="loading" />
    </div>

    <!-- Empty State -->
    <div v-if="searchedInstruments.length === 0 && !loading" class="text-center py-12">
      <div class="text-gray-500 text-lg mb-2">No instruments found</div>
      <div class="text-custom-grey text-sm">Try adjusting your search or category filter</div>
    </div>

    <!-- Instruments List -->
    <div v-else class="px-4 py-4">
      <div class="space-y-3">
        <div v-for="instrument in searchedInstruments" :key="instrument.id"
          class="bg-white rounded-lg p-4 flex items-center justify-between border border-custom-border">
          <div class="flex-1">
            <div class="font-semibold text-custom-text">{{ instrument.tradingsymbol }}</div>
            <!-- <div class="text-gray-500 text-sm">{{ instrument.name }}</div> -->
            <div class="text-custom-grey text-xs">{{ instrument.segment }} • {{ instrument.expiry }}</div>
          </div>

          <button v-if="!isAlreadyAdded(instrument)" @click="addScript(instrument)"
            class="px-4 py-2 bg-custom-text text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Add
          </button>
          <button v-else disabled
            class="px-4 py-2 bg-custom-text opacity-70 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Added
          </button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import useWatchlistStore from "@/stores/watchlist";
import LoaderComponent from "@/components/LoaderComponent.vue";

const watchlistStore = useWatchlistStore();
const { searchedInstruments, watchlists, activeSegment } = storeToRefs(watchlistStore);

const searchQueryInput = ref("");
let debounceTimer = null;
const loading = ref(false);


const isAlreadyAdded = (tradingSymbol) => {
  const watchlist = watchlists.value.find(w => w.name == activeSegment.value);

  if (!watchlist) return false;
  return watchlist.symbols.some(s => s.token == tradingSymbol?.instrument_token)

}

watch(searchQueryInput, (val) => {
  loading.value = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await watchlistStore.searchTokens(val);
    loading.value = false;

  }, 400);
});

// ADD SCRIPT PAYLOAD
const addScript = async (item) => {
  const payload = {
    script: item.name,
    instrument_type: item.instrument_type,
    symbol: item.tradingsymbol,
    token: String(item.instrument_token),
    segment: activeSegment.value,
    exchange: item.exchange,
    expiry_date: item.expiry || "",
    lot_size: item.lot_size,
    strike: item.strike
  };


  await watchlistStore.addSymbolToWatchlist(payload);
};

const goBack = () => {

  router.push({ name: 'watchlist' })
}
</script>
