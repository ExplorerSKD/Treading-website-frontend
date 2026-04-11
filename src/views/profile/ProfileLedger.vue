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
        <div v-else v-for="item in transactions" :key="item.id" class="bg-white rounded-lg ">

            <!-- TOP ROW -->
            <div class="flex justify-between items-center">
                <div class="flex gap-4 w-full">
                    <div class="bg-[#F5F5F5] rounded-lg p-4 h-fit ">
                        <img src="/svg/arrow-dark.svg" :class="{ 'rotate-180': item.type == 'WITHDRAWAL' }" alt="">
                    </div>
                    <div class="w-full space-y-2 border-b border-custom-border pb-6">

                        <div class="flex flex-1 items-center w-full justify-between">

                            <div class="text-[14px] font-medium text-custom-text">
                                <p>
                                    {{ item.type }}
                                </p>
                                <p class="text-[11px] text-custom-grey font-medium">
                                    {{ formatDate(item.created_at) }}
                                </p>


                            </div>

                            <div>

                                <div>

                                    <span class="font-semibold text-[14px] text-custom-primary">
                                        ₹{{ item.amount }}
                                    </span>
                                    <p class=" text-[11px] font-semibold text-end " :class="statusClass(item.status)">
                                        {{ item.status }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <!-- REMARK (ONLY IF PRESENT) -->
                        <div v-if="item.admin_remark" class="text-[11px] text-custom-red bg-red-50 p-2 rounded">
                            <strong>Remark:</strong> {{ item.admin_remark }}
                        </div>
                    </div>
                </div>



            </div>



            <!-- SCREENSHOT AND EDIT BUTTON -->
            <div class="pt-2 flex items-center gap-3">
                <a v-if="item.screenshot_url" :href="getScreenshotUrl(item.screenshot_url)" target="_blank"
                    class="text-sm rounded-full px-4 py-2 bg-custom-primary text-white hover:bg-custom-text font-semibold">
                    View Screenshot
                </a>

                <!-- EDIT BUTTON (Only for PENDING transactions) -->
                <button v-if="item.status === 'PENDING'" @click="editTransaction(item)"
                    class="text-sm rounded-full px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold transition-colors duration-150">
                    Edit Request
                </button>
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

const statusClass = (status) => {
    switch (status) {
        case 'COMPLETED':
            return 'text-custom-green'
        case 'REJECTED':
            return 'text-custom-red'
        case 'PENDING':
            return ' text-yellow-700'
        default:
            return 'text-gray-700'
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