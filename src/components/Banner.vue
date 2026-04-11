<template>
    <div class="banner-carousel-container ">
        <div class="carousel ">
            <div class="carousel__viewport ">
                <div v-for="(banner, index) in banners" :key="index" class="carousel__slide"
                    :class="{ active: index === currentIndex }" :style="{
                        backgroundImage: `url(${banner})`,
                        transform: `translateX(${(index - currentIndex) * 102}%)`
                    }" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const banners = [
    '/png/banner-1.png',
    '/png/banner-2.png',
    '/png/banner-3.png'
]

const currentIndex = ref(0)
let interval

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % banners.length
}

onMounted(() => {
    interval = setInterval(nextSlide, 2500)
})

onBeforeUnmount(() => {
    clearInterval(interval)
})
</script>

<style>
.banner-carousel-container {
    width: 90vw;
    height: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.carousel {
    width: 100%;
    height: 100%;
}

.carousel__viewport {
    position: relative;
    width: 100%;
    height: 100%;
}

.carousel__slide {
    position: absolute;
    width: 80vw;
    height: 420px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.8s ease, opacity 0.8s ease;
    opacity: 0.4;
}

.carousel__slide.active {
    opacity: 1;
}

/* Mobile */
@media (max-width: 768px) {
    .carousel__slide {
        width: 80vw;
        height: 100px;
    }

    .banner-carousel-container {
        height: 100px;
    }
}

@media (max-width: 480px) {
    .carousel__slide {
        width: 90vw;
        height: 100px;
    }
}
</style>