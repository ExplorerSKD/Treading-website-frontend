<template>
    <Teleport to="body">
        <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end md:items-center justify-center" tabindex="-1"
            @keydown.esc="close">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/50" @click="close" />

            <!-- Modal Container -->
            <div class="relative w-full max-w-2xl mx-auto
               bg-white rounded-t-2xl md:rounded-2xl
               max-h-[90vh] overflow-y-auto
               animate-slide-up" @click.stop>
                <!-- CONTENT -->
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['close']);
const close = () => {
    emit('close')
}


</script>

<style scoped>
@keyframes slide-up {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-slide-up {
    animation: slide-up 0.3s ease-out;
}
</style>
