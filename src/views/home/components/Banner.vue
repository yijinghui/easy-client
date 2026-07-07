<template>
<div class="page-content">
    <div class="banner-container">
      <div v-if="banners.length === 0" class="banner-skeleton"></div>
      <template v-else>
        <div class="banner-3d-wrapper" @mouseenter="stopBannerTimer" @mouseleave="startBannerTimer">
          <div 
            v-for="(banner, index) in banners" 
            :key="banner.id" 
            class="banner-item"
            :style="getBannerStyle(index)"
            @click="goToBanner(index)"
          >
            <img :src="banner.url" :alt="`轮播图${index + 1}`" class="banner-image" />
          </div>
        </div>
        
        <button class="banner-arrow banner-arrow-left" @click="prevBanner">
          <span class="arrow-icon">‹</span>
        </button>
        <button class="banner-arrow banner-arrow-right" @click="nextBanner">
          <span class="arrow-icon">›</span>
        </button>
        
        <div class="banner-indicators">
          <span 
            v-for="(banner, index) in banners" 
            :key="banner.id" 
            class="indicator"
            :class="{ active: index === currentBannerIndex }"
            @click="goToBanner(index)"
          ></span>
        </div>
      </template>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getBannerList } from '@/api/banner'
import { resolveFileUrl } from '@/utils/asset'

const banners = ref([])
const currentBannerIndex = ref(0)
let bannerTimer = null

onMounted(() => {
  fetchBanners()
  startBannerTimer()
})

onUnmounted(() => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
})

const fetchBanners = async () => {
  try {
    const res = await getBannerList()
    if (res.data && Array.isArray(res.data)) {
      banners.value = res.data.map(banner => ({
        id: banner.bannerId,
        url: resolveFileUrl(banner.bannerUrl)
      }))
    }
  } catch (error) {
    console.error('获取轮播图失败', error)
    banners.value = [
      { id: 1, url: 'https://picsum.photos/650/280?random=1' },
      { id: 2, url: 'https://picsum.photos/650/280?random=2' },
      { id: 3, url: 'https://picsum.photos/650/280?random=3' },
    ]
  }
}

const startBannerTimer = () => {
  if (bannerTimer) clearInterval(bannerTimer)
  if (banners.value.length > 1) {
    bannerTimer = setInterval(() => {
      currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
    }, 5000)
  }
}

const stopBannerTimer = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

const goToBanner = (index) => {
  currentBannerIndex.value = index
}

const prevBanner = () => {
  currentBannerIndex.value = currentBannerIndex.value === 0 ? banners.value.length - 1 : currentBannerIndex.value - 1
}

const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
}

const getBannerStyle = (index) => {
  const total = banners.value.length
  if (total <= 1) {
    return {
      transform: 'translateX(0) scale(1)',
      opacity: 1,
      zIndex: 10
    }
  }
  
  const distance = (index - currentBannerIndex.value + total) % total
  const reverseDistance = (currentBannerIndex.value - index + total) % total
  const minDistance = Math.min(distance, reverseDistance)
  
  if (minDistance > 1) {
    return {
      transform: 'translateX(0) scale(0.8)',
      opacity: 0,
      zIndex: 0
    }
  }
  
  const isLeft = distance <= total / 2
  const offset = isLeft ? -1 : 1
  
  if (minDistance === 0) {
    return {
      transform: 'translateX(0) scale(1)',
      opacity: 1,
      zIndex: 10
    }
  } else if (minDistance === 1) {
    return {
      transform: `translateX(${offset * 270}px) scale(0.75)`,
      opacity: 0.5,
      zIndex: 5
    }
  }
  
  return {
    transform: 'translateX(0) scale(0.8)',
    opacity: 0,
    zIndex: 0
  }
}
</script>

<style scoped>
.page-content {
  h2 {
    font-size: 20px;
    color: #303133;
    margin: 0 0 20px 0;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay .play-icon {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin-left: 2px;
}

.card-info {
  padding: 12px;
}

.card-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-container {
  position: relative;
  width: 100%;
  height: 320px;
  margin: 0 auto 24px;
  border-radius: 12px;
  overflow: hidden;
  perspective: 1000px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.banner-3d-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-item {
  position: absolute;
  width: 650px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.banner-container:hover .banner-arrow {
  opacity: 1;
}

.banner-arrow:hover {
  background: rgba(255, 255, 255, 0.45);
}

.banner-arrow-left {
  left: 20px;
}

.banner-arrow-right {
  right: 20px;
}

.arrow-icon {
  font-size: 36px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

.banner-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 20;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  width: 24px;
  border-radius: 5px;
  background: #409eff;
}

.banner-skeleton {
  width: 100%;
  height: 280px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>