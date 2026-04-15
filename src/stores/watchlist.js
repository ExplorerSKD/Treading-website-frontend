import { makeRequest } from "@/request/requests";
import { defineStore } from "pinia"
import { ref, watch } from "vue"
import { useTickerStore } from "./ticker";
import { symbolSegment } from "@/utils/symbolsegment";

const useWatchlistStore = defineStore('watchlist', () => {
    const endpoint = 'watchlist';
    const searchQuery = ref('');
    const searchedInstruments = ref([]);
    const selectedWatchlist = ref(null);
    const watchlists = ref([]);
    const tickerStore = useTickerStore();
    const activeSegment = ref(localStorage.getItem('activeSegment') || '');
    const showOrderModal = ref(false);
    const selectedScript = ref(null);
    const topCommodities = ref(null);
    const loading = ref(false);


    function extractUniqueTokens(data) {
        const specialSegments = new Set(symbolSegment);

        return [
            ...new Set(
                data.flatMap(watchlist =>
                    watchlist.symbols.map(sym => {
                        return specialSegments.has(watchlist.name)
                            ? String(sym.symbol)
                            : String(sym.token);
                    })
                )
            )
        ];
    }

    const getWatchlists = async () => {

        loading.value = true
        try {
            const res = await makeRequest(endpoint, 'GET', {}, {});
            if (res.data) {
                watchlists.value = res.data || [];
                if (watchlists.value.length > 0) {
                    if (watchlists.value.find(w => w.name == activeSegment.value))
                        selectedWatchlist.value = watchlists.value.find(w => w.name == activeSegment.value);
                    else selectedWatchlist.value = watchlists.value[0]
                    if (activeSegment.value == '') activeSegment.value = selectedWatchlist.value.name
                }

                tickerStore.updateTickerList(extractUniqueTokens(watchlists.value))

            }

        } catch (error) {
            console.log('error in watchlist store', error);
        }
        finally {
            loading.value = false
        }
    }

    const deleteScripts = async (arr, config = {}) => {
        try {
            const res = await makeRequest(endpoint, 'POST', { id: selectedWatchlist.value.id, symbols: arr }, config, {}, 'symbols/remove')
            if (res.data) {
                getWatchlists();
            }
        } catch (error) {
            console.log('error in watchlist store', error);
        }
    }



    const addSymbolToWatchlist = async (symbol, config = {}) => {
        try {


            const res = await makeRequest(endpoint, 'POST', symbol, config, {}, 'add');

            if (res.data) {
                getWatchlists()
                return res.data
            }
        } catch (error) {
            console.log('error in watchlist store', error);
        }
    }



    const searchTokens = async (query) => {
        try {
            if (!query) {
                searchedInstruments.value = [];
                return;
            }
            const res = await makeRequest('instruments', 'GET', {}, {}, { q: query, segment: activeSegment.value }, 'search');

            if (res.data) {
                searchedInstruments.value = res.data;
            }
        } catch (error) {
            console.log('error in watchlist store', error);
        }
    };

    const getTopCommodities = async () => {
        try {
            const res = await makeRequest('instruments', 'GET', {}, {}, {}, 'top-commodities')
            if (res.data) {
                topCommodities.value = res.data
            }
        } catch (error) {
            console.log('error in watchlist store', error);
        }
    }

    watch(activeSegment, () => {
        localStorage.setItem('activeSegment', activeSegment.value)
    })


    getWatchlists();
    return {
        searchQuery,
        searchTokens,
        addSymbolToWatchlist,
        searchedInstruments,
        getTopCommodities,
        topCommodities,
        getWatchlists,
        deleteScripts,
        showOrderModal,
        endpoint,
        watchlists,
        selectedWatchlist,
        activeSegment,
        selectedScript,
        loading
    }
})

export default useWatchlistStore;