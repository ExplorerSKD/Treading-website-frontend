<template>
    <div v-if="props.show" class="flex items-center text-black justify-center p-4 -rotate-90">
        <div class="w-24">
            <LottieAnimation animation-path="/loading.json" />

        </div>
    </div>
</template>

<script setup>
import LottieAnimation from './LottieAnimation.vue';

const props = defineProps({
    show: {
        type: Boolean,
    }
})

</script>

<style lang="scss" scoped></style>