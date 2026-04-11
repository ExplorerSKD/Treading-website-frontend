<template>
    <label :for="id" class="relative inline-flex items-center justify-center cursor-pointer">
        <input :id="id" :disabled="disabled" :name="name" :checked="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement)?.checked)" type="checkbox"
            class="sr-only peer" />
        <div class="w-10 h-5 bg-[#D9D9D9] rounded-full transition-all duration-200"></div>
        <div :class="[modelValue ? 'bg-black' : 'bg-white']"
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform duration-200">
        </div>
    </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    id: {
        type: String,
        default() {
            return `switch-${Math.random().toString(16).slice(2)}`;
        },
    },
    name: String,
    modelValue: Boolean,
    disabled: {
        type: Boolean,
        default: false,
    },
});

const id = computed(() => {
    return `${props.id}-${Math.random().toString(16).slice(2)}`
})
</script>