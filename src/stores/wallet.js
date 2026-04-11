import { makeRequest } from "@/request/requests";
import { defineStore, storeToRefs } from "pinia"
import { ref } from "vue";


export const useWalletStore = defineStore('wallet', () => {

    const endpoint = 'wallet';
    const wallet = ref({});
    const transactions = ref([]);
    const showRequestModal = ref(false);
    const requestMode = ref('');
    const adminBankDetails = ref(null);
    const transactionType = ref('DEPOSIT')
    const loading = ref(false);
    const editingTransaction = ref(false);

    const getWallet = async () => {
        try {
            const res = await makeRequest(endpoint, 'GET', {}, {}, {}, 'me');
            if (res.data) {
                wallet.value = res.data;
            }
        } catch (error) {
            console.log('error in wallet store', error);
        }
    }

    const getTransactions = async () => {
        try {
            loading.value = true
            const res = await makeRequest(endpoint, 'GET', {}, {}, { type: transactionType.value }, 'transactions');
            if (res.data) {
                transactions.value = res.data.items;
            }
        } catch (error) {
            console.log('error in wallet store', error)
        } finally {
            loading.value = false
        }
    }

    const sendRequest = async (payload) => {
        try {

            const res = await makeRequest(endpoint, 'POST', payload, {}, {}, requestMode.value)
            if (res.data) {
                return res.data
            }
        } catch (error) {
            console.log('error in wallet store', error)
        }
    }

    const getAdminBankDetails = async () => {
        try {
            const res = await makeRequest('adminBank', 'GET');
            if (res.data) adminBankDetails.value = res.data;
        } catch (error) {

            console.log('error in wallet store', error)
        }
    }

    const modifyTransactionRequest = async (data, id) => {
        try {
            const res = await makeRequest(endpoint, 'PUT', data, {}, {}, `transactions/${id}`, 'modify')
        } catch (error) {

            console.log('error in wallet store', error)
        }
    }

    getWallet()
    getTransactions()
    getAdminBankDetails()

    return {
        wallet,
        requestMode,
        getWallet,
        getTransactions,
        showRequestModal,
        sendRequest,
        transactions,
        loading,
        getAdminBankDetails,
        adminBankDetails,
        transactionType,
        editingTransaction,
        modifyTransactionRequest
    }
})