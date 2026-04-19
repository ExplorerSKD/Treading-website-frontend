<template>
    <div class="space-y-4">


        <div v-if="loading">
            <LoaderComponent :show="loading" />
        </div>


        <!-- EMPTY STATE -->
        <div v-else-if="!transactions.length && !loading" class="text-center text-custom-grey py-10">
            No ledger records found
        </div>

        <!-- LEDGER CARD -->
        <div v-else v-for="item in transactions" :key="item.id" class="bg-white rounded-2xl p-4 shadow-sm border border-custom-border mb-4 transition-all hover:shadow-md">

            <!-- TOP ROW -->
            <div class="flex items-start gap-4">
                <div class="bg-gray-50 rounded-xl p-3 h-fit flex-shrink-0">
                    <img src="/svg/arrow-dark.svg" :class="{ 'rotate-180': item.type == 'WITHDRAWAL' }" class="w-4 h-4" alt="">
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                        <div class="min-w-0">
                            <p class="text-[calc(15px*var(--font-scale))] font-bold text-custom-primary truncate">
                                {{ item.type }}
                            </p>
                            <p class="text-[calc(11px*var(--font-scale))] text-gray-500 font-medium">
                                {{ formatDate(item.created_at) }}
                            </p>
                        </div>

                        <div class="text-right flex-shrink-0 ml-2">
                            <p class="font-black text-[calc(15px*var(--font-scale))] text-custom-primary leading-tight">
                                ₹{{ formatAmount(item.amount) }}
                            </p>
                            <p class="text-[calc(10px*var(--font-scale))] font-black uppercase tracking-wider mt-0.5" :class="statusClass(item.status)">
                                {{ item.status }}
                            </p>
                        </div>
                    </div>

                    <!-- REMARK (ONLY IF PRESENT) -->
                    <div v-if="item.admin_remark" class="mt-3 text-[calc(11px*var(--font-scale))] text-custom-red bg-red-50/50 p-2.5 rounded-xl border border-red-100/50">
                        <span class="font-bold opacity-70">Remark:</span> {{ item.admin_remark }}
                    </div>

                    <!-- SCREENSHOT AND EDIT BUTTON -->
                    <div class="mt-4 flex flex-wrap items-center gap-2">
                        <a v-if="item.screenshot_url" :href="getScreenshotUrl(item.screenshot_url)" target="_blank"
                            class="text-[calc(12px*var(--font-scale))] px-4 py-2 bg-custom-primary text-white rounded-xl font-bold transition-all hover:bg-black active:scale-95">
                            View Screenshot
                        </a>

                        <!-- EDIT BUTTON (Only for PENDING transactions) -->
                        <button v-if="item.status === 'PENDING'" @click="editTransaction(item)"
                            class="text-[calc(12px*var(--font-scale))] px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold transition-all hover:bg-blue-100 active:scale-95">
                            Edit Request
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import { storeToRefs } from 'pinia';
import config from '@/matrixcnfg.js'
import LoaderComponent from '@/components/LoaderComponent.vue';


const walletStore = useWalletStore();
const { transactions, loading, showRequestModal, requestMode, editingTransaction } = storeToRefs(walletStore)

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

const statusClass = (status) => {
    switch (status) {
        case 'COMPLETED':
            return 'text-custom-green'
        case 'REJECTED':
            return 'text-custom-red'
        case 'PENDING':
            return 'text-yellow-600'
        default:
            return 'text-gray-500'
    }
}

const getScreenshotUrl = (path) => {
    // adjust if you already have a helper
    let baseUrl;
    if (config.env === "production") {
        baseUrl = window.location.origin;
    } else {
        baseUrl = "https://xvlg0zv7-5000.inc1.devtunnels.ms";
    }
    return `${baseUrl}/${path}`
}

const editTransaction = (transaction) => {
    // Set the transaction type (deposit/withdraw)
    requestMode.value = transaction.type === 'DEPOSIT' ? 'deposit' : 'withdraw'

    // Set the transaction to be edited
    editingTransaction.value = transaction

    // Open the modal
    showRequestModal.value = true
}
</script>