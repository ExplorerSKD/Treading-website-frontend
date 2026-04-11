<template>
    <Modal :modelValue="modelValue" @close="onCancel">
        <div class="px-5 py-6">
            <!-- Title -->
            <h3 class="text-base font-semibold text-black mb-2">
                {{ title }}
            </h3>

            <!-- Message -->
            <p class="text-sm text-gray-600 mb-6">
                {{ message }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
                <!-- Cancel -->
                <button class="flex-1 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700"
                    @click="onCancel">
                    {{ cancelText }}
                </button>

                <!-- Confirm -->
                <button class="flex-1 py-2 rounded-xl bg-custom-primary text-white text-sm font-medium"
                    @click="onConfirm">
                    {{ confirmText }}
                </button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal.vue'

defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: 'Are you sure?',
    },
    message: {
        type: String,
        default: 'This action cannot be undone.',
    },
    confirmText: {
        type: String,
        default: 'Confirm',
    },
    cancelText: {
        type: String,
        default: 'Cancel',
    },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const onCancel = () => {
    emit('update:modelValue', false)
    emit('cancel')
}

const onConfirm = () => {
    emit('update:modelValue', false)
    emit('confirm')
}
</script>
