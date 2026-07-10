<template>
  <div class="page-content comment-page">
    <div class="comment-song-info">
      <img :src="currentCommentSong.cover" class="comment-song-cover" />
      <div class="comment-song-details">
        <h3 class="comment-song-name">{{ currentCommentSong.name }}</h3>
        <p class="comment-song-artist">{{ currentCommentSong.artist }}</p>
        <p class="comment-song-album">{{ currentCommentSong.album }}</p>
      </div>
    </div>
    
    <div class="comment-section">
      <div class="comment-header-bar">
        <h3>评论</h3>
        <span v-if="commentCount > 0" class="comment-count">{{ commentCount }}条</span>
      </div>
      
      <CommentList
        ref="commentListRef"
        :comments="comments"
        :song-id="currentCommentSong.id"
        :reply-target-comment="replyTargetComment"
        :reply-content="replyContent"
        :is-loading-more="isLoadingMore"
        :has-more="hasMore"
        @reply="handleReplyComment"
        @reply-content-change="handleReplyContentChange"
        @send-reply="handleSendReply"
        @load-more="loadMoreComments"
      />
      
      <ReplyForm
        v-model="newCommentContent"
        @submit="handleAddComment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSongComments, addSongComment } from '@/api/comment'
import { getUserAvatar } from '@/utils/asset'
import { usePlayerStore } from '@/stores/player'
import CommentList from './components/CommentList.vue'
import ReplyForm from './components/ReplyForm.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const commentListRef = ref(null)

const currentCommentSong = computed(() => {
  const songId = Number(route.params.songId)
  if (playerStore.currentSong.id === songId) {
    return playerStore.currentSong
  }
  return {
    id: songId,
    name: route.query.name || '',
    artist: route.query.artist || '',
    album: route.query.album || '',
    cover: route.query.cover || ''
  }
})

const comments = ref([])
const newCommentContent = ref('')
const currentRootId = ref(0)
const replyTargetComment = ref(null)
const replyContent = ref('')
const currentFirstId = ref(0)
const commentCount = ref(0)
const isLoadingMore = ref(false)
const hasMore = ref(true)

onMounted(() => {
  fetchComments()
})

watch(
  () => route.params.songId,
  () => {
    refreshComments()
  }
)

const transformComments = (list) => {
  if (!list) return []
  return list.map(comment => ({
    commentId: comment.commentId,
    userId: comment.userId,
    username: comment.username || '匿名用户',
    userAvatar: getUserAvatar(comment.userAvatar),
    content: comment.content,
    createTime: comment.createTime,
    likeCount: comment.likeCount || 0,
    isLiked: comment.isLiked ?? comment.isLike ?? false,
    childrenCount: comment.childrenCount || 0,
    replyUsername: comment.replyUsername || '',
    parentId: comment.parentId ?? 0,
    rootId: comment.rootId ?? comment.commentId,
    showReplies: false,
    replies: []
  }))
}

const fetchComments = async (isRefresh = false) => {
  try {
    const params = {
      rootId: currentRootId.value,
      firstId: currentFirstId.value
    }
    
    const res = await getSongComments(currentCommentSong.value.id, params)
    if (res.data) {
      if (isRefresh) {
        comments.value = transformComments(res.data.list)
      } else {
        comments.value = [...comments.value, ...transformComments(res.data.list)]
      }
      
      if (res.data.lastId !== undefined) {
        currentFirstId.value = res.data.lastId
      }
      
      if (res.data.lastId === -1 || !res.data.list || res.data.list.length === 0) {
        hasMore.value = false
      }
    }
  } catch (error) {
    console.error('获取评论失败', error)
    ElMessage.error('获取评论失败')
  } finally {
    isLoadingMore.value = false
  }
}

const handleReplyComment = (comment) => {
  if (replyTargetComment.value && replyTargetComment.value.commentId === comment.commentId) {
    replyTargetComment.value = null
  } else {
    replyTargetComment.value = comment
    replyContent.value = ''
  }
}

const handleReplyContentChange = (content) => {
  replyContent.value = content
}

const handleAddComment = async (content) => {
  try {
    await addSongComment(currentCommentSong.value.id, {
      content,
      parentId: 0,
      rootId: 0
    })
    ElMessage.success('评论发表成功')
    refreshComments()
  } catch (error) {
    console.error('发表评论失败', error)
    ElMessage.error('发表评论失败')
  }
}

const handleSendReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('未登录，登录后才能回复评论')
    router.push('/login')
    return
  }
  
  if (!replyTargetComment.value) {
    return
  }
  
  try {
    const parentId = replyTargetComment.value.commentId
    const rootId = replyTargetComment.value.rootId && replyTargetComment.value.rootId !== 0 
      ? replyTargetComment.value.rootId 
      : replyTargetComment.value.commentId
    
    await addSongComment(currentCommentSong.value.id, {
      content: replyContent.value,
      parentId: parentId,
      rootId: rootId
    })
    ElMessage.success('回复成功')
    replyContent.value = ''
    replyTargetComment.value = null
    refreshComments()
  } catch (error) {
    console.error('回复失败', error)
    ElMessage.error('回复失败')
  }
}

const refreshComments = async () => {
  currentFirstId.value = 0
  hasMore.value = true
  comments.value = []
  await fetchComments(true)
}

const loadMoreComments = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  await fetchComments(false)
}
</script>

<style scoped>
.comment-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.comment-song-info {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.comment-song-cover {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.comment-song-details {
  flex: 1;
}

.comment-song-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.comment-song-artist {
  font-size: 14px;
  color: #606266;
  margin: 0 0 5px 0;
}

.comment-song-album {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.comment-section {
  background: #fff;
  border-radius: 8px;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comment-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header-bar h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.comment-count {
  font-size: 14px;
  color: #909399;
}
</style>