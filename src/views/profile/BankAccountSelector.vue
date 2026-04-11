<template>
    <div class="space-y-3">

        <!-- Saved Accounts List -->
        <div v-if="bankAccounts.length > 0" class="space-y-2">
            <p class="text-xs font-medium text-custom-grey uppercase tracking-wide">Saved Accounts</p>

            <div v-for="account in bankAccounts" :key="account.id" @click="selectAccount(account)"
                class="relative flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150"
                :class="selectedId === account.id
                    ? 'border-custom-primary bg-custom-primary/5'
                    : 'border-custom-border hover:border-custom-primary/50 bg-white'">

                <!-- Radio dot -->
                <div class="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                    :class="selectedId === account.id ? 'border-custom-primary' : 'border-gray-300'">
                    <div v-if="selectedId === account.id" class="w-2 h-2 rounded-full bg-custom-primary"></div>
                </div>

                <!-- Account Info -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-sm text-gray-900 truncate">
                            {{ account.account_holder_name }}
                        </span>
                        <span v-if="account.bank_name"
                            class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {{ account.bank_name }}
                        </span>
                        <span v-if="account.is_primary"
                            class="text-xs bg-custom-primary/10 text-custom-primary px-2 py-0.5 rounded-full font-medium">
                            Primary
                        </span>
                    </div>
                    <p class="text-xs text-custom-grey mt-0.5">
                        ···· {{ account.account_number?.slice(-4) }}
                        <span v-if="account.upi_id" class="ml-2">· {{ account.upi_id }}</span>
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 shrink-0" @click.stop>
                    <!-- <button @click="startEdit(account)"
                        class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                        </svg>
                    </button> -->
                    <button @click="confirmDelete(account)"
                        class="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Add New Account Button (if under limit) -->
        <button v-if="bankAccounts.length < 3" @click="startAdd"
            class="w-full flex items-center justify-center gap-2 border-2 border-dashed border-custom-border rounded-xl py-3 text-sm font-medium text-custom-grey hover:border-custom-primary hover:text-custom-primary transition-all duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ bankAccounts.length === 0 ? 'Add Bank Account' : 'Add Another Account' }}
            <span class="text-xs opacity-60">({{ bankAccounts.length }}/3)</span>
        </button>

        <p v-else class="text-xs text-center text-custom-grey">
            Maximum 3 accounts saved. Delete one to add a new account.
        </p>

        <!-- Add / Edit Form -->
        <transition name="slide-down">
            <div v-if="showForm" class="border border-custom-border rounded-xl p-4 space-y-3 bg-gray-50">

                <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-semibold text-gray-800">
                        {{ editingAccount ? 'Edit Account' : 'New Bank Account' }}
                    </p>
                    <button @click="cancelForm"
                        class="p-1 rounded-lg hover:bg-gray-200 transition-colors text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Account Holder Name -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Account Holder Name <span class="text-red-500">*</span>
                    </label>
                    <input v-model="form.account_holder_name" type="text" placeholder="Full name on account"
                        :class="{ 'border-red-400': formErrors.account_holder_name }"
                        class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none border-custom-border bg-white" />
                    <p v-if="formErrors.account_holder_name" class="text-red-500 text-xs mt-0.5">
                        {{ formErrors.account_holder_name }}
                    </p>
                </div>

                <!-- Bank Name -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                    <input v-model="form.bank_name" type="text" placeholder="e.g. State Bank of India"
                        class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none border-custom-border bg-white" />
                </div>

                <!-- Account Number -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Account Number <span class="text-red-500">*</span>
                    </label>
                    <input v-model="form.account_number" type="text" placeholder="Bank account number"
                        :class="{ 'border-red-400': formErrors.account_number }"
                        class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none border-custom-border bg-white" />
                    <p v-if="formErrors.account_number" class="text-red-500 text-xs mt-0.5">
                        {{ formErrors.account_number }}
                    </p>
                </div>

                <!-- IFSC -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        IFSC Code <span class="text-red-500">*</span>
                    </label>
                    <input v-model="form.ifsc_code" type="text" placeholder="e.g. SBIN0001234"
                        :class="{ 'border-red-400': formErrors.ifsc_code }"
                        class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none border-custom-border bg-white"
                        @input="form.ifsc_code = form.ifsc_code.toUpperCase()" />
                    <p v-if="formErrors.ifsc_code" class="text-red-500 text-xs mt-0.5">
                        {{ formErrors.ifsc_code }}
                    </p>
                </div>

                <!-- UPI ID -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">UPI ID</label>
                    <input v-model="form.upi_id" type="text" placeholder="yourname@upi"
                        :class="{ 'border-red-400': formErrors.upi_id }"
                        class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none border-custom-border bg-white" />
                    <p v-if="formErrors.upi_id" class="text-red-500 text-xs mt-0.5">
                        {{ formErrors.upi_id }}
                    </p>
                </div>

                <!-- Primary toggle -->
                <div class="flex items-center gap-2 pt-1">
                    <button @click="form.is_primary = !form.is_primary" type="button"
                        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none"
                        :class="form.is_primary ? 'bg-custom-primary' : 'bg-gray-300'">
                        <span
                            class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                            :class="form.is_primary ? 'translate-x-4' : 'translate-x-0'"></span>
                    </button>
                    <span class="text-xs text-gray-600">Set as primary account</span>
                </div>

                <!-- Save Button -->
                <button @click="saveAccount" :disabled="savingAccount"
                    class="w-full bg-custom-primary text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                    {{ savingAccount ? 'Saving...' : (editingAccount ? 'Update Account' : 'Save Account') }}
                </button>
            </div>
        </transition>

        <!-- Delete Confirm -->
        <transition name="fade">
            <div v-if="deletingAccount" class="border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
                <p class="text-sm font-medium text-red-700">
                    Delete <span class="font-bold">{{ deletingAccount.account_holder_name }}</span>'s account?
                </p>
                <p class="text-xs text-red-500">This action cannot be undone.</p>
                <div class="flex gap-2">
                    <button @click="deletingAccount = null"
                        class="flex-1 text-sm border border-red-300 text-red-600 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors">
                        Cancel
                    </button>
                    <button @click="deleteAccount" :disabled="deletingLoading"
                        class="flex-1 text-sm bg-red-500 text-white py-1.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {{ deletingLoading ? 'Deleting...' : 'Delete' }}
                    </button>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useToastStore } from '@/stores/utils/toast'
import useUserBankAccountStore from '@/stores/bank'

const props = defineProps({
    modelValue: { type: [Number, String, null], default: null }
})
const emit = defineEmits(['update:modelValue', 'accountSelected'])

const bankAccountStore = useUserBankAccountStore()
const { bankAccounts, loading } = storeToRefs(bankAccountStore)

const selectedId = ref(props.modelValue)
const showForm = ref(false)
const editingAccount = ref(null)
const deletingAccount = ref(null)
const savingAccount = ref(false)
const deletingLoading = ref(false)

const emptyForm = () => ({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    bank_name: '',
    is_primary: false,
})

const form = ref(emptyForm())
const formErrors = ref({})

watch(() => props.modelValue, (v) => selectedId.value = v)

const selectAccount = (account) => {
    selectedId.value = account.id
    emit('update:modelValue', account.id)
    emit('accountSelected', account)
}

const startAdd = () => {
    editingAccount.value = null
    form.value = emptyForm()
    formErrors.value = {}
    showForm.value = true
    deletingAccount.value = null
}

const startEdit = (account) => {
    editingAccount.value = account
    form.value = {
        account_holder_name: account.account_holder_name || '',
        account_number: account.account_number || '',
        ifsc_code: account.ifsc_code || '',
        upi_id: account.upi_id || '',
        bank_name: account.bank_name || '',
        is_primary: account.is_primary || false,
    }
    formErrors.value = {}
    showForm.value = true
    deletingAccount.value = null
}

const cancelForm = () => {
    showForm.value = false
    editingAccount.value = null
    formErrors.value = {}
}

const validateForm = () => {
    const errs = {}

    if (!form.value.account_holder_name?.trim()) {
        errs.account_holder_name = 'Account holder name is required'
    } else if (form.value.account_holder_name.trim().length < 3) {
        errs.account_holder_name = 'Name must be at least 3 characters'
    }

    if (!form.value.account_number?.trim()) {
        errs.account_number = 'Account number is required'
    } else if (!/^\d{9,18}$/.test(form.value.account_number.trim())) {
        errs.account_number = 'Enter a valid account number (9–18 digits)'
    }

    if (!form.value.ifsc_code?.trim()) {
        errs.ifsc_code = 'IFSC code is required'
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.value.ifsc_code.trim())) {
        errs.ifsc_code = 'Enter a valid IFSC code (e.g. SBIN0001234)'
    }

    if (form.value.upi_id && !form.value.upi_id.includes('@')) {
        errs.upi_id = 'Enter a valid UPI ID (e.g. name@upi)'
    }

    formErrors.value = errs
    return Object.keys(errs).length === 0
}

const saveAccount = async () => {
    if (!validateForm()) return

    savingAccount.value = true
    try {
        const payload = { ...form.value }

        if (editingAccount.value) {
            await bankAccountStore.updateBankAccount(editingAccount.value.id, payload)
            useToastStore().addToast('Account updated successfully', '', 'success')
        } else {
            const created = await bankAccountStore.createBankAccount(payload)
            if (created) {
                selectAccount(created)
            }
            useToastStore().addToast('Account saved successfully', '', 'success')
        }

        cancelForm()
    } catch (e) {
        useToastStore().addToast('Failed to save account', '', 'error')
    } finally {
        savingAccount.value = false
    }
}

const confirmDelete = (account) => {
    deletingAccount.value = account
    showForm.value = false
}

const deleteAccount = async () => {
    if (!deletingAccount.value) return
    deletingLoading.value = true
    try {
        await bankAccountStore.deleteBankAccount(deletingAccount.value.id)

        if (selectedId.value === deletingAccount.value.id) {
            selectedId.value = null
            emit('update:modelValue', null)
            emit('accountSelected', null)
        }

        useToastStore().addToast('Account deleted', '', 'success')
        deletingAccount.value = null
    } catch (e) {
        useToastStore().addToast('Failed to delete account', '', 'error')
    } finally {
        deletingLoading.value = false
    }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-4px);
}

.slide-down-enter-to,
.slide-down-leave-from {
    opacity: 1;
    max-height: 600px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>