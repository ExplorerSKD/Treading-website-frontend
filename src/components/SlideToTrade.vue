<template>
    <div class="space-y-4">
        <!-- Slide to Select (shown only when no side selected) -->
        <div v-if="!side" class="relative w-full h-16 rounded-full bg-custom-border overflow-hidden select-none"
            ref="containerRef" @mousedown="handleStart" @mousemove="handleMove" @mouseup="handleEnd"
            @mouseleave="handleEnd" @touchstart.prevent="handleTouchStart" @touchmove.prevent="handleTouchMove"
            @touchend.prevent="handleEnd">

            <!-- Right BUY zone -->
            <div class="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center transition-all duration-300"
                :class="{ 'scale-110': dragPosition > 85 && isDragging }">
                <div class="relative">
                    <div class="absolute inset-0 bg-custom-green rounded-full blur-xl opacity-0 transition-opacity duration-300"
                        :class="{ 'opacity-50 animate-pulse': dragPosition > 85 && isDragging }">
                    </div>
                    <span class="relative text-sm font-bold text-custom-green transition-all duration-300"
                        :class="{ 'text-lg': dragPosition > 80 }">
                        BUY
                    </span>
                </div>
            </div>

            <!-- Left SELL zone -->
            <div class="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center transition-all duration-300"
                :class="{ 'scale-110': dragPosition < 15 && isDragging }">
                <div class="relative">
                    <div class="absolute inset-0 bg-custom-red rounded-full blur-xl opacity-0 transition-opacity duration-300"
                        :class="{ 'opacity-50 animate-pulse': dragPosition < 15 && isDragging }">
                    </div>
                    <span class="relative text-sm font-bold text-custom-red transition-all duration-300"
                        :class="{ 'text-lg': dragPosition < 20 }">
                        SELL
                    </span>
                </div>
            </div>

            <!-- Draggable slider button -->
            <div class="absolute top-15 -translate-y-1/2" :style="{
                left: `${dragPosition}%`,
                transform: `translate(-50%, -50%) scale(${isDragging ? 1.1 : 1})`,
                transition: isDragging ? 'transform 0.15s ease-out' : 'all 0.3s ease-out'
            }" :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'">
                <div class="relative">
                    <!-- Glow effect -->
                    <div class="absolute inset-0 rounded-full blur-xl transition-all duration-300" :class="{
                        'bg-custom-green opacity-60 scale-150': dragPosition > 85 && isDragging,
                        'bg-custom-red opacity-60 scale-150': dragPosition < 15 && isDragging,
                        'bg-blue-400 opacity-30': isDragging && dragPosition >= 15 && dragPosition <= 85
                    }">
                    </div>

                    <!-- Main button -->
                    <div class="relative w-24 h-14 rounded-full shadow-2xl flex items-center justify-center border-4 transition-all duration-300"
                        :class="{
                            'bg-custom-green border-custom-green': dragPosition > 75 && isDragging,
                            'bg-custom-red border-custom-red': dragPosition < 25 && isDragging,
                            'bg-custom-primary border-custom-primary': !isDragging || (dragPosition >= 25 && dragPosition <= 75)
                        }">
                        <div class="relative w-full h-full flex items-center justify-center">
                            <!-- Center text -->
                            <div class="absolute inset-0 flex items-center justify-center transition-all duration-200">
                                <p class="text-white font-semibold text-sm">{{ dragPosition > 75 && isDragging ? 'Buy' :
                                    dragPosition < 25 && isDragging ? 'Sell' : 'Slide Me' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Animation & Selection Display -->
        <transition enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-300 ease-in" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="side" class="space-y-4">
                <!-- Rest of the form with stagger animation -->
                <div class="space-y-3 animate-fade-in-up" style="animation-delay: 200ms">
                    <slot></slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const side = ref(props.modelValue)
const dragPosition = ref(50)
const isDragging = ref(false)
const containerRef = ref(null)

const handleStart = (e) => {
    isDragging.value = true
    updatePosition(e.clientX)
}

const handleTouchStart = (e) => {
    isDragging.value = true
    updatePosition(e.touches[0].clientX)
}

const handleMove = (e) => {
    if (!isDragging.value) return
    updatePosition(e.clientX)
}

const handleTouchMove = (e) => {
    if (!isDragging.value) return
    updatePosition(e.touches[0].clientX)
}

const handleEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false

    // Only select if dragged to extreme
    if (dragPosition.value >= 90) {
        side.value = 'BUY'
        emit('update:modelValue', 'BUY')
    } else if (dragPosition.value <= 10) {
        side.value = 'SELL'
        emit('update:modelValue', 'SELL')
    } else {
        // Reset to center
        dragPosition.value = 50
    }
}

const updatePosition = (clientX) => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    dragPosition.value = percentage
}

const resetSide = () => {
    side.value = ''
    emit('update:modelValue', '')
    setTimeout(() => {
        dragPosition.value = 50
    }, 100)
}

watch(() => props.modelValue, (newVal) => {
    side.value = newVal
    if (!newVal) {
        dragPosition.value = 50
    }
})
</script>

<style scoped>
.select-none {
    user-select: none;
    -webkit-user-select: none;
}

@keyframes bounce-slow {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.animate-bounce-slow {
    animation: bounce-slow 2s infinite;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
}
</style>