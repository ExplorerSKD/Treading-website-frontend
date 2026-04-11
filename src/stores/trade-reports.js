import { makeRequest } from "@/request/requests"
import { defineStore } from "pinia"
import { ref } from "vue"
import { useTickerStore } from "./ticker"
import { symbolSegment } from "@/utils/symbolsegment"

export const useTradeReportStore = defineStore('tradeReport', () => {

    const endpoint = 'positions'
    const tickerStore = useTickerStore()

    // state
    const trades = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const loading = ref(false)

    // single source of truth
    const params = ref({
        status: 'CLOSED',   // strictly CLOSED
        start_date: null,   // YYYY-MM-DD
        end_date: null,     // YYYY-MM-DD
        search: '',
        page: 1,
        limit: 20,          // 👈 added
    })

    const getTradeReport = async () => {
        loading.value = true
        try {
            const cleanParams = Object.fromEntries(
                Object.entries(params.value).filter(([_, value]) => {
                    if (value === null || value === undefined) return false
                    if (typeof value === 'string' && value.trim() === '') return false
                    return true
                })
            )

            const res = await makeRequest(
                endpoint,
                'GET',
                {},
                {},
                cleanParams
            )

            if (res?.data) {
                trades.value = res.data.positions || res.data || []

                const tokens = trades.value.map(p =>
                    symbolSegment.includes(p.segment)
                        ? String(p.symbol)
                        : String(p.instrument_token)
                )
                tickerStore.updateTickerList(tokens)

                currentPage.value = res.data.page || 1
                totalPages.value = res.data.total_page || 1
            }
        } catch (error) {
            console.log('error in trade report store', error)
        } finally {
            loading.value = false
        }
    }

    getTradeReport()

    return {
        trades,
        currentPage,
        totalPages,
        loading,
        params,
        getTradeReport,
    }
})
