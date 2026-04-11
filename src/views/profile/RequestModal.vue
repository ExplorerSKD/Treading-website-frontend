<template>
    <Modal :model-value="showRequestModal" @close="closeModal">
        <div class="p-6 space-y-5">

            <!-- HEADER -->
            <h2 class="text-lg font-semibold text-gray-900">
                {{ isEditMode ? 'Edit Transaction Request' : (isDeposit ? 'Deposit Funds' : 'Withdraw Funds') }}
            </h2>

            <!-- ================= DEPOSIT ================= -->
            <template v-if="isDeposit">
                <div v-if="adminBankDetails" class="flex bg-gray-100 rounded-lg p-1 text-sm font-medium">

                    <button class="flex-1 py-2 rounded-md transition" :class="activeDepositTab === 'bank'
                        ? 'bg-white shadow text-black'
                        : 'text-gray-500'" @click="activeDepositTab = 'bank'">
                        Bank Details
                    </button>

                    <button class="flex-1 py-2 rounded-md transition" :class="activeDepositTab === 'qr'
                        ? 'bg-white shadow text-black'
                        : 'text-gray-500'" @click="activeDepositTab = 'qr'">
                        QR Code
                    </button>
                </div>
                <!-- BANK DETAILS -->
                <div v-if="activeDepositTab === 'bank' && adminBankDetails"
                    class="bg-gray-100 rounded-lg p-4 space-y-3 text-sm mt-4">

                    <!-- Account Name -->
                    <div class="flex items-center justify-between gap-2">
                        <p>
                            <strong>Account Name:</strong> {{ adminBankDetails.account_name }}
                        </p>
                        <button @click="copyText(adminBankDetails.account_name, 'Account Name')"
                            class="hover:bg-black/5 rounded-lg p-2 transition-colors duration-150">
                            <img src="/svg/copy.svg" class="w-4" alt="">
                        </button>
                    </div>

                    <!-- Account Number -->
                    <div class="flex items-center justify-between gap-2">
                        <p>
                            <strong>Account Number:</strong> {{ adminBankDetails.account_number }}
                        </p>
                        <button @click="copyText(adminBankDetails.account_number, 'Account Number')"
                            class="hover:bg-black/5 rounded-lg p-2 transition-colors duration-150">
                            <img src="/svg/copy.svg" class="w-4" alt="">
                        </button>
                    </div>

                    <!-- IFSC -->
                    <div class="flex items-center justify-between gap-2">
                        <p>
                            <strong>IFSC:</strong> {{ adminBankDetails.ifsc_code }}
                        </p>
                        <button @click="copyText(adminBankDetails.ifsc_code, 'IFSC')"
                            class="hover:bg-black/5 rounded-lg p-2 transition-colors duration-150">
                            <img src="/svg/copy.svg" class="w-4" alt="">
                        </button>
                    </div>

                    <!-- UPI -->
                    <div class="flex items-center justify-between gap-2">
                        <p>
                            <strong>UPI ID:</strong> {{ adminBankDetails.upi }}
                        </p>
                        <button @click="copyText(adminBankDetails.upi, 'UPI ID')"
                            class="hover:bg-black/5 rounded-lg p-2 transition-colors duration-150">
                            <img src="/svg/copy.svg" class="w-4" alt="">
                        </button>
                    </div>

                </div>
                <!-- QR TAB -->
                <div v-if="activeDepositTab === 'qr' && adminBankDetails"
                    class="bg-gray-100 rounded-lg p-4 space-y-4 text-sm mt-4 flex flex-col items-center">

                    <template v-if="adminBankDetails.qr_code_url">
                        <img :src="adminBankDetails.qr_code_url" alt="QR Code"
                            class="w-56 h-56 object-contain rounded-lg border border-gray-300 bg-white p-2" />
                        <p class="text-xs text-gray-500 text-center">
                            Scan this QR to make payment
                        </p>
                    </template>

                    <template v-else>
                        <p class="text-gray-500 text-center">
                            QR code not available
                        </p>
                    </template>

                </div>

                <div v-else-if="!adminBankDetails"
                    class="bg-gray-100 rounded-lg p-4 space-y-2 text-sm flex items-center justify-center flex-col">
                    <h2 class="font-bold text-xl">Bank Account Not Connected</h2>
                    <p>Contact admin for further details</p>
                </div>

                <!-- LIMIT REACHED WARNING
                <div v-if="!isEditMode && depositLimitReached"
                    class="bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg p-3">
                    ❌ Maximum deposit amount reached for this bank account.
                </div> -->

                <!-- AMOUNT -->
                <div v-if="adminBankDetails || isEditMode">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Amount <span class="text-red-500">*</span>
                    </label>
                    <input type="number" v-model="amount" placeholder="Enter deposit amount"
                        :disabled="!isEditMode && depositLimitReached" :class="{ 'border-red-500': errors.amount }"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border disabled:bg-gray-200" />
                    <p v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount }}</p>
                </div>

                <!-- SCREENSHOT -->
                <div class="space-y-2" v-if="adminBankDetails || isEditMode">
                    <label class="block text-sm font-medium text-custom-text">
                        Payment Screenshot <span class="text-red-500">*</span>
                    </label>

                    <!-- Existing Screenshot Preview (for edit mode) -->
                    <div v-if="isEditMode && existingScreenshotUrl && !screenshot" class="space-y-2">
                        <div class="relative border-2 border-custom-border rounded-lg p-2">
                            <img :src="existingScreenshotUrl" alt="Current Payment Screenshot"
                                class="w-full h-auto rounded-lg max-h-64 object-contain" />
                            <div
                                class="absolute top-4 right-4 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
                                Current
                            </div>
                        </div>
                        <p class="text-xs text-custom-grey text-center">Current screenshot (upload new to replace)</p>
                    </div>

                    <!-- Upload Area (show only when no new screenshot) -->
                    <div v-if="!screenshot" class="relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-4
           hover:border-custom-primary transition
           disabled:opacity-50" :class="{
            'pointer-events-none opacity-50': !isEditMode && depositLimitReached,
            'border-custom-border': !errors.screenshot,
            'border-red-500': errors.screenshot
        }">
                        <!-- Hidden input -->
                        <input type="file" accept="image/*" @change="handleFileChange"
                            :disabled="!isEditMode && depositLimitReached"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

                        <!-- Content -->
                        <div class="flex flex-col items-center text-center space-y-1">
                            <img src="/svg/arrow-up-from-line.svg" alt="">
                            <p class="text-sm font-medium text-custom-text">
                                {{ isEditMode ? 'Click to upload new screenshot' : 'Click to upload or drag & drop' }}
                            </p>
                            <p class="text-xs text-custom-grey">
                                PNG, JPG up to 1MB
                            </p>
                        </div>
                    </div>

                    <!-- New Screenshot Preview (show when new screenshot exists) -->
                    <div v-else class="space-y-2">
                        <div class="relative border-2 border-custom-border rounded-lg p-2">
                            <img :src="screenshotPreview" alt="Payment Screenshot"
                                class="w-full h-auto rounded-lg max-h-64 object-contain" />
                            <button @click="removeScreenshot" type="button"
                                class="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p class="text-xs text-custom-grey text-center">{{ screenshot.name }}</p>
                    </div>

                    <p v-if="errors.screenshot" class="text-red-500 text-xs mt-1">{{ errors.screenshot }}</p>
                    <p v-else-if="!isEditMode && depositLimitReached" class="text-xs text-custom-red">
                        Deposit limit reached. Upload disabled.
                    </p>
                </div>


            </template>

            <!-- ================= WITHDRAW ================= -->
            <template v-else>

                <!-- AMOUNT -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Amount <span class="text-red-500">*</span>
                    </label>
                    <input type="number" v-model="withdraw.amount" placeholder="Enter withdrawal amount"
                        :class="{ 'border-red-500': errors.amount }"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border" />
                    <p v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount }}</p>
                    <p v-else class="text-sm font-semibold text-black/60 mt-1">
                        Maximum withdrawal limit ₹{{ availableMargin.toFixed(2) }}
                    </p>
                </div>

                <!-- BANK ACCOUNT SELECTOR -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Bank / UPI Account <span class="text-red-500">*</span>
                    </label>

                    <BankAccountSelector v-model="selectedBankAccountId" @accountSelected="fillFromSavedAccount" />

                    <p v-if="errors.bank_account" class="text-red-500 text-xs mt-1">{{ errors.bank_account }}</p>
                </div>

                <!-- MANUAL FIELDS (shown when no saved account selected OR always editable) -->
                <div v-if="!selectedBankAccountId" class="space-y-3">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-px bg-gray-200"></div>
                        <span class="text-xs text-custom-grey">or fill manually</span>
                        <div class="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <!-- UPI ID -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input type="text" v-model="withdraw.upi_mobile" placeholder="yourname@upi"
                            :class="{ 'border-red-500': errors.upi_mobile }"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border" />
                        <p v-if="errors.upi_mobile" class="text-red-500 text-xs mt-1">{{ errors.upi_mobile }}</p>
                    </div>

                    <!-- ACCOUNT NAME -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Account Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" v-model="withdraw.account_name" placeholder="Account holder name"
                            :class="{ 'border-red-500': errors.account_name }"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border" />
                        <p v-if="errors.account_name" class="text-red-500 text-xs mt-1">{{ errors.account_name }}</p>
                    </div>

                    <!-- ACCOUNT NUMBER -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Account Number <span class="text-red-500">*</span>
                        </label>
                        <input type="text" v-model="withdraw.account_number" placeholder="Bank account number"
                            :class="{ 'border-red-500': errors.account_number }"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border" />
                        <p v-if="errors.account_number" class="text-red-500 text-xs mt-1">{{ errors.account_number }}
                        </p>
                    </div>

                    <!-- IFSC -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            IFSC Code <span class="text-red-500">*</span>
                        </label>
                        <input type="text" v-model="withdraw.ifsc_code" placeholder="IFSC code"
                            :class="{ 'border-red-500': errors.ifsc_code }"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none border-custom-border"
                            @input="withdraw.ifsc_code = withdraw.ifsc_code.toUpperCase()" />
                        <p v-if="errors.ifsc_code" class="text-red-500 text-xs mt-1">{{ errors.ifsc_code }}</p>
                    </div>
                </div>

                <!-- Selected account summary (read-only preview) -->
                <div v-else
                    class="bg-gray-50 rounded-lg px-3 py-2 text-xs text-custom-grey border border-custom-border">
                    <span class="font-medium text-gray-700">Using:</span>
                    {{ withdraw.account_name }} · ···· {{ withdraw.account_number?.slice(-4) }}
                    <span v-if="withdraw.upi_mobile"> · {{ withdraw.upi_mobile }}</span>
                    <button @click="clearSelectedAccount" class="ml-2 text-custom-primary hover:underline font-medium">
                        Change
                    </button>
                </div>

            </template>

            <!-- ACTIONS -->
            <div class="flex gap-4 pt-4">
                <button class="w-full border border-custom-border text-custom-primary py-2 rounded-lg font-semibold"
                    @click="closeModal">
                    Cancel
                </button>
                <button v-if="!isDeposit || isEditMode || (isDeposit && adminBankDetails)" class="w-full bg-custom-primary text-white py-2 rounded-lg font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading ||
                            (!isEditMode && isDeposit && depositLimitReached) ||
                            (!isDeposit && withdrawExceedsMargin)
                            " @click="submit">
                    {{ loading ? 'Submitting...' : (isEditMode ? 'Update Request' : 'Submit Request') }}
                </button>
            </div>

        </div>
    </Modal>
</template>

<script setup>
import Modal from '@/components/Modal.vue'
import { usePositionStore } from '@/stores/position'
import { useProfileStore } from '@/stores/profile'
import { useScriptSettingStore } from '@/stores/scriptsetting'
import { useTickerStore } from '@/stores/ticker'
import { useToastStore } from '@/stores/utils/toast'
import { useWalletStore } from '@/stores/wallet'
import { calculatePnl } from '@/utils/pnl'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import BankAccountSelector from './BankAccountSelector.vue'

const walletStore = useWalletStore()
const profileStore = useProfileStore();
const scriptSettingStore = useScriptSettingStore();

const { scriptSettings } = storeToRefs(scriptSettingStore)
const { profile } = storeToRefs(profileStore)
const { showRequestModal, requestMode, adminBankDetails, wallet, editingTransaction } =
    storeToRefs(walletStore)

const isDeposit = computed(() => requestMode.value === 'deposit')
const isEditMode = computed(() => !!editingTransaction.value)
const selectedBankAccountId = ref(null)
/* ================= STATE ================= */

const amount = ref('')
const screenshot = ref(null)
const loading = ref(false)
const existingScreenshotUrl = ref('')
const activeDepositTab = ref('bank') // 'bank' | 'qr'

const withdraw = ref({
    amount: '',
    upi_mobile: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
})

/* ================= WATCH FOR EDITING ================= */

watch(editingTransaction, (transaction) => {
    if (transaction) {
        // Populate form with existing transaction data
        if (transaction.type === 'DEPOSIT') {
            amount.value = transaction.amount || ''
            existingScreenshotUrl.value = transaction.screenshot || ''
        } else {
            withdraw.value = {
                amount: transaction.amount || '',
                upi_mobile: transaction.upi_mobile || '',
                account_name: transaction.account_name || '',
                account_number: transaction.account_number || '',
                ifsc_code: transaction.ifsc_code || '',
            }
        }
    }
}, { immediate: true })

/* ================= VALIDATION ================= */

const errors = ref({
    amount: '',
    screenshot: '',
    upi_mobile: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
})

const clearErrors = () => {
    errors.value = {
        amount: '',
        screenshot: '',
        upi_mobile: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
    }
}

const fillFromSavedAccount = (account) => {
    if (!account) return
    withdraw.value.account_name = account.account_holder_name || ''
    withdraw.value.account_number = account.account_number || ''
    withdraw.value.ifsc_code = account.ifsc_code || ''
    withdraw.value.upi_mobile = account.upi_id || ''
    // Clear any existing field errors
    errors.value.account_name = ''
    errors.value.account_number = ''
    errors.value.ifsc_code = ''
    errors.value.upi_mobile = ''
}

const clearSelectedAccount = () => {
    selectedBankAccountId.value = null
    withdraw.value.account_name = ''
    withdraw.value.account_number = ''
    withdraw.value.ifsc_code = ''
    withdraw.value.upi_mobile = ''
}

const validateDeposit = () => {
    clearErrors()
    let isValid = true

    if (!amount.value || amount.value <= 0) {
        errors.value.amount = 'Please enter a valid amount'
        isValid = false
    } else if (amount.value < 1) {
        errors.value.amount = 'Minimum deposit amount is ₹1'
        isValid = false
    }

    // In edit mode, screenshot is optional (can keep existing)
    if (!isEditMode.value && !screenshot.value) {
        errors.value.screenshot = 'Please upload payment screenshot'
        isValid = false
    } else if (screenshot.value) {
        const maxSize = 1 * 1024 * 1024 // 1MB
        if (screenshot.value.size > maxSize) {
            errors.value.screenshot = 'File size must be less than 1MB'
            isValid = false
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
        if (!allowedTypes.includes(screenshot.value.type)) {
            errors.value.screenshot = 'Only PNG and JPG files are allowed'
            isValid = false
        }
    }

    return isValid
}

const validateWithdraw = () => {
    clearErrors()
    let isValid = true

    if (!withdraw.value.amount || withdraw.value.amount <= 0) {
        errors.value.amount = 'Please enter a valid amount'
        isValid = false
    } else if (withdraw.value.amount < 1) {
        errors.value.amount = 'Minimum withdrawal amount is ₹1'
        isValid = false
    } else if (Number(withdraw.value.amount) > Number(availableMargin.value)) {
        errors.value.amount = `Amount exceeds available margin of ₹${availableMargin.value.toFixed(2)}`
        isValid = false
    }
    else if (!withdraw.value.upi_mobile.includes('@')) {
        errors.value.upi_mobile = 'Enter a valid upi id'
        isValid = false
    }
    if (!withdraw.value.account_name || withdraw.value.account_name.trim() === '') {
        errors.value.account_name = 'Account name is required'
        isValid = false
    } else if (withdraw.value.account_name.trim().length < 3) {
        errors.value.account_name = 'Account name must be at least 3 characters'
        isValid = false
    }

    if (!withdraw.value.account_number || withdraw.value.account_number.trim() === '') {
        errors.value.account_number = 'Account number is required'
        isValid = false
    } else if (!/^\d{9,18}$/.test(withdraw.value.account_number.trim())) {
        errors.value.account_number = 'Please enter a valid account number (9-18 digits)'
        isValid = false
    }

    if (!withdraw.value.ifsc_code || withdraw.value.ifsc_code.trim() === '') {
        errors.value.ifsc_code = 'IFSC code is required'
        isValid = false
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(withdraw.value.ifsc_code.trim().toUpperCase())) {
        errors.value.ifsc_code = 'Please enter a valid IFSC code (e.g., SBIN0001234)'
        isValid = false
    }

    return isValid
}

/* ================= BUSINESS RULE ================= */

const depositLimitReached = computed(() => {
    if (!adminBankDetails.value) return false
    return (
        Number(adminBankDetails.value.total_received) >=
        Number(adminBankDetails.value.amt_after_change_upi)
    )
})

/* ================= HELPERS ================= */

const closeModal = () => {
    showRequestModal.value = false
    editingTransaction.value = null
    resetForm()
}

const resetForm = () => {
    if (screenshotPreview.value) {
        URL.revokeObjectURL(screenshotPreview.value)
    }

    activeDepositTab.value = 'bank' // reset tab
    selectedBankAccountId.value = null

    amount.value = ''
    screenshot.value = null
    existingScreenshotUrl.value = ''
    withdraw.value = {
        amount: '',
        upi_mobile: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
    }
    clearErrors()
}

const screenshotPreview = computed(() => {
    if (!screenshot.value) return null
    return URL.createObjectURL(screenshot.value)
})

const removeScreenshot = () => {
    if (screenshotPreview.value) {
        URL.revokeObjectURL(screenshotPreview.value)
    }
    screenshot.value = null
    errors.value.screenshot = ''
}

const handleFileChange = (e) => {
    screenshot.value = e.target.files[0]
    errors.value.screenshot = ''
}

/* ================= SUBMIT ================= */

const submit = async () => {
    // Validate before submitting
    if (isDeposit.value) {
        if (!validateDeposit()) {
            useToastStore().addToast('Please fix the errors before submitting', '', 'error')
            return
        }
    } else {
        if (!validateWithdraw()) {
            useToastStore().addToast('Please fix the errors before submitting', '', 'error')
            return
        }
    }

    loading.value = true
    try {
        if (isEditMode.value) {
            await updateTransaction()
        } else {
            if (isDeposit.value) {
                await submitDeposit()
            } else {
                await submitWithdraw()
            }
        }

        await walletStore.getTransactions()
        closeModal()
    } finally {
        loading.value = false
    }
}

const updateTransaction = async () => {
    const fd = new FormData()

    if (isDeposit.value) {
        fd.append('amount', amount.value)

        // Only append bank_account_id if it exists in the original transaction
        if (editingTransaction.value.bank_account_id) {
            fd.append('bank_account_id', editingTransaction.value.bank_account_id)
        }

        // Only append screenshot if a new one was uploaded
        if (screenshot.value) {
            fd.append('screenshot', screenshot.value)
        }
    } else {
        fd.append('amount', withdraw.value.amount)

        if (withdraw.value.upi_mobile) {
            fd.append('upi_mobile', withdraw.value.upi_mobile)
        }

        if (withdraw.value.account_name) {
            fd.append('account_name', withdraw.value.account_name)
        }

        if (withdraw.value.account_number) {
            fd.append('account_number', withdraw.value.account_number)
        }

        if (withdraw.value.ifsc_code) {
            fd.append('ifsc_code', withdraw.value.ifsc_code)
        }
    }

    await walletStore.modifyTransactionRequest(fd, editingTransaction.value.id)
}

const submitDeposit = async () => {
    if (depositLimitReached.value) return

    const fd = new FormData()
    fd.append('amount', amount.value)
    fd.append('bank_account_id', adminBankDetails.value.id)
    fd.append('screenshot', screenshot.value)

    await walletStore.sendRequest(fd)
}

const submitWithdraw = async () => {
    const formData = new FormData()

    formData.append('amount', withdraw.value.amount)

    if (withdraw.value.upi_mobile) {
        formData.append('upi_mobile', withdraw.value.upi_mobile)
    }

    if (withdraw.value.account_name) {
        formData.append('account_name', withdraw.value.account_name)
    }

    if (withdraw.value.account_number) {
        formData.append('account_number', withdraw.value.account_number)
    }

    if (withdraw.value.ifsc_code) {
        formData.append('ifsc_code', withdraw.value.ifsc_code)
    }

    await walletStore.sendRequest(formData)
}

const copyText = async (text, type) => {
    try {
        await navigator.clipboard.writeText(text)
        useToastStore().addToast(`${type} copied!`, '', 'success')
    } catch (err) {
        console.error('Copy failed', err)
    }
}

const positionStore = usePositionStore();
const tickerStore = useTickerStore()
const { openPositions } = storeToRefs(positionStore)

const activeSegmentSettigs = (pos) => {
    if (!pos?.segment || !pos?.side) return null

    const key = `${pos.segment}-${pos.side}`

    const profileSettings = profile.value?.settings?.segment_settings
    const script = scriptSettings.value.find(s => s.segments?.includes(pos.segment) && (s.scripts?.includes('ALL') || s.scripts?.includes(pos.script)))

    const hasScriptOverride =
        script &&
        script.segments?.includes(pos.segment) &&
        (
            script.scripts?.includes('ALL') ||
            script.scripts?.includes(pos.script)
        ) &&
        script.segment_settings?.[key]

    if (hasScriptOverride) {
        return script.segment_settings[key]
    }

    return profileSettings?.[key] || null
}

const totalPnl = computed(() => {
    let sum = 0
    openPositions.value.forEach(pos => {
        sum += Number(calculatePnl(pos, tickerStore) || 0)
    })
    return sum
})

const utilizedFunds = computed(() => {
    let sum = 0

    openPositions.value.forEach(pos => {
        const activeSegmentSetting = activeSegmentSettigs(pos);

        const reqMargin = pos.side == 'BUY' ? pos.buy_value : pos.sell_value
        const totalLots = pos.lots

        const leverage = ['CNC', 'NRML'].includes(pos.product_type) ?
            activeSegmentSetting?.holding_leverage : activeSegmentSetting?.intraday_leverage

        const type = ['CNC', 'NRML'].includes(pos.product_type) ? activeSegmentSetting?.holding_leverage_type : activeSegmentSetting?.intraday_leverage_type


        const calcFunds = (type, margin, leverage, lots) => {

            let result = margin

            if (type === 'fixed_leverage') {
                result = margin - leverage
            }

            else if (type === 'fixed') {
                result = lots * leverage
            }
            else result = margin / leverage

            return Math.max(0, Number(result).toFixed(2))
        }
        sum += calcFunds(type, reqMargin, leverage, totalLots)
    })

    return sum
})

const availableMargin = computed(() => {
    const balance = Number(wallet.value.balance || 0)

    return balance - utilizedFunds.value + (totalPnl.value >= 0 ? 0 : totalPnl.value)
})

const withdrawExceedsMargin = computed(() => {
    if (!withdraw.value.amount) return false
    return Number(withdraw.value.amount) > Number(availableMargin.value)
})

</script>