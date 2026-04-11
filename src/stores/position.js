import { makeRequest } from "@/request/requests"
import { defineStore } from "pinia"
import { ref } from "vue"
import { useTickerStore } from "./ticker"
import { symbolSegment } from "@/utils/symbolsegment"

export const usePositionStore = defineStore('positions', () => {

    const endpoint = 'positions'

    const tickerStore = useTickerStore()
    // state
    const positions = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const loading = ref(false);
    const openPositions = ref([])
    const selectedPosition = ref(null);
    const showPositionModal = ref(false);

    // single source of truth
    const params = ref({
        status: 'OPEN',   // OPEN | ACTIVE | CLOSED | COMBINED
        search: '',
        page: 1,
    })

    const getPositions = async () => {
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
                // supports both array & paginated response
                positions.value = res.data.positions || res.data || []
                const tokens = positions.value.map(p => symbolSegment.includes(p.segment) ? String(p.symbol) : String(p.instrument_token))
                tickerStore.updateTickerList(tokens)
                currentPage.value = res.data.page || 1
                totalPages.value = res.data.total_page || 1
            }
        } catch (error) {
            console.log('error in position store', error)
        } finally {
            loading.value = false
        }
    }

    const getOpenPositions = async () => {
        try {
            const res = await makeRequest(endpoint, 'GET', {}, {}, { limit: 100, status: 'OPEN' })
            if (res.data) {
                openPositions.value = res.data.positions

                const tokens = openPositions.value.map(p => symbolSegment.includes(p.segment) ? String(p.symbol) : String(p.instrument_token))
                tickerStore.updateTickerList(tokens)
            }
        } catch (error) {
            console.log('error in position store', error)
        }
    }

    const sqoffPosition = async (form) => {
        try {
            const res = await makeRequest(endpoint, 'POST', form, {}, {}, 'square-off')
            if (res.data) {
                return res.data
            }
        } catch (error) {
            console.log('error in positions store', error)
        }

    }

    const sqoffAllPosition = async () => {
        try {
            const res = await makeRequest(endpoint, 'POST', { mode: 'all' }, {}, {}, 'square-off')
            if (res.data) {
                return res.data
            }
        } catch (error) {
            console.log('error in positions store', error)
        }

    }

    getPositions()
    getOpenPositions()

    return {
        // state
        positions,
        currentPage,
        sqoffAllPosition,
        totalPages,
        loading,
        params,
        openPositions,
        // actions
        getPositions,
        getOpenPositions,
        sqoffPosition,
        selectedPosition,
        showPositionModal
    }
})
