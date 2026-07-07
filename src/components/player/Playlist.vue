<template>
  <div class="playlist-popup" v-if="visible" @click.stop>
    <div class="playlist-header">
      <span class="playlist-title">播放队列</span>
      <span class="playlist-count">{{ playerStore.playlist.length + playerStore.playQueue.length }} 首</span>
      <span class="playlist-close" @click="handleClose">×</span>
    </div>
    <div class="playlist-list">
      <div 
        v-for="(song, index) in playerStore.playlist" 
        :key="`playlist-${song.id}-${index}`"
        class="playlist-item"
        :class="{ playing: index === playerStore.currentIndex }"
        @click="handlePlaySong(index)"
      >
        <div class="item-cover">
          <img :src="song.cover" :alt="song.name" />
        </div>
        <div class="item-info">
          <span class="item-name">{{ song.name }}</span>
          <span class="item-artist">{{ song.artist }}</span>
        </div>
      </div>
      <div v-if="playerStore.playQueue.length > 0" class="queue-divider">
        <span>待播放</span>
      </div>
      <div 
        v-for="(song, index) in playerStore.playQueue" 
        :key="`queue-${song.id}-${index}`"
        class="playlist-item queued"
        @click="handlePlayQueuedSong(index)"
      >
        <div class="item-cover">
          <img :src="song.cover" :alt="song.name" />
        </div>
        <div class="item-info">
          <span class="item-name">{{ song.name }}</span>
          <span class="item-artist">{{ song.artist }}</span>
        </div>
        <span class="queue-badge">下一首</span>
      </div>
      <div v-if="playerStore.playlist.length === 0 && playerStore.playQueue.length === 0" class="playlist-empty">
        暂无播放歌曲
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const playerStore = usePlayerStore()

const handleClose = () => {
  emit('close')
}

const handlePlaySong = (index) => {
  playerStore.playSong(index)
  emit('close')
}

const handlePlayQueuedSong = (index) => {
  const queuedSong = playerStore.playQueue[index]
  playerStore.playlist.splice(playerStore.currentIndex + 1, 0, queuedSong)
  playerStore.playQueue.splice(index, 1)
  playerStore.playSong(playerStore.currentIndex + 1)
  emit('close')
}

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.playlist-popup {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 340px;
  max-height: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 2000;
}

.playlist-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #9fb1c4;
  color: #fff;
}

.playlist-title {
  font-size: 14px;
  font-weight: 600;
}

.playlist-count {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 8px;
}

.playlist-close {
  margin-left: auto;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.playlist-close:hover {
  opacity: 1;
}

.playlist-list {
  max-height: 340px;
  overflow-y: auto;
}

.playlist-list::-webkit-scrollbar {
  width: 4px;
}

.playlist-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.playlist-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.playlist-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 10px;
}

.playlist-item:hover {
  background: #f8fafc;
}

.playlist-item.playing {
  background: #f0f5ff;
}

.item-index {
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.index-num {
  font-size: 12px;
  color: #94a3b8;
}

.playing-icon {
  color: #409eff;
  font-size: 14px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.item-cover {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-artist {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-duration {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.playlist-empty {
  padding: 32px;
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
}

.queue-divider {
  padding: 8px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.queue-divider span {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.playlist-item.queued {
  opacity: 0.85;
}

.playlist-item.queued:hover {
  background: #f1f5f9;
}

.queue-badge {
  font-size: 10px;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-left: auto;
}
</style>
