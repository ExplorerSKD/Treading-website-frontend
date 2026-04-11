import { defineStore } from "pinia"
import { ref } from "vue"
import { makeRequest } from "@/request/requests"

const useUserBankAccountStore = defineStore("userBankAccount", () => {
    const endpoint = "userBankAccounts"

    const bankAccounts = ref([])
    const selectedAccount = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // ================= GET ALL =================
    const getBankAccounts = async () => {
        loading.value = true
        error.value = null

        try {
            const res = await makeRequest(endpoint, "GET")

            if (res?.data) {
                bankAccounts.value = res.data
            }
        } catch (err) {
            console.log("Error fetching bank accounts:", err)
            error.value = err
        } finally {
            loading.value = false
        }
    }

    // ================= GET SINGLE =================
    const getBankAccountById = async (id) => {
        loading.value = true
        error.value = null

        try {
            const res = await makeRequest(endpoint, "GET", {}, {}, {}, id)

            if (res?.data) {
                selectedAccount.value = res.data
                return res.data
            }
        } catch (err) {
            console.log("Error fetching bank account:", err)
            error.value = err
        } finally {
            loading.value = false
        }
    }

    // ================= CREATE =================
    const createBankAccount = async (payload) => {
        loading.value = true
        error.value = null

        try {
            const res = await makeRequest(endpoint, "POST", payload)

            if (res?.data) {
                await getBankAccounts()
                return res.data
            }
        } catch (err) {
            console.log("Error creating bank account:", err)
            error.value = err
        } finally {
            loading.value = false
        }
    }

    // ================= UPDATE =================
    const updateBankAccount = async (id, payload) => {
        loading.value = true
        error.value = null

        try {
            const res = await makeRequest(endpoint, "PUT", payload, {}, {}, id)

            if (res?.data) {
                await getBankAccounts()
                return res.data
            }
        } catch (err) {
            console.log("Error updating bank account:", err)
            error.value = err
        } finally {
            loading.value = false
        }
    }

    // ================= DELETE =================
    const deleteBankAccount = async (id) => {
        loading.value = true
        error.value = null

        try {
            const res = await makeRequest(endpoint, "DELETE", {}, {}, {}, id)

            if (res?.data) {
                await getBankAccounts()
                return res.data
            }
        } catch (err) {
            console.log("Error deleting bank account:", err)
            error.value = err
        } finally {
            loading.value = false
        }
    }

    getBankAccounts()
    return {
        bankAccounts,
        selectedAccount,
        loading,
        error,
        getBankAccounts,
        getBankAccountById,
        createBankAccount,
        updateBankAccount,
        deleteBankAccount,
    }
})

export default useUserBankAccountStore