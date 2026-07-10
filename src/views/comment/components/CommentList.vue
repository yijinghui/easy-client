<template>
  <div 
    ref="commentListRef"
    class="comment-list-container"
  >
    <div class="comment-list">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
        <div class="comment-header">
          <el-avatar :size="44" :src="comment.userAvatar" class="comment-avatar">
            <User v-if="!comment.userAvatar" />
          </el-avatar>
          <div class="comment-user-info">
            <div class="comment-user-header">
              <span class="comment-username">{{ comment.username }}</span>
            </div>
            <span class="comment-time">{{ comment.createTime }}</span>
          </div>
        </div>
        <div class="comment-content">
          <span v-if="comment.replyUsername && comment.rootId !== comment.parentId" class="reply-to-user">回复 {{ comment.replyUsername }}：</span>
          {{ comment.content }}
        </div>
        <div class="comment-actions">
          <div class="comment-actions-left">
            <span class="comment-action like-action" :class="{ liked: comment.isLiked }" @click="handleLikeComment(comment)">
              <img src="/src/assets/icons/like.svg" class="action-icon" />
              <span>{{ comment.likeCount }}</span>
            </span>
            <span class="comment-action reply-action" :class="{ active: replyTargetComment && replyTargetComment.commentId === comment.commentId }" @click="handleReplyComment(comment)">
              <img src="/src/assets/icons/reply.svg" class="action-icon" />
              <span>回复</span>
            </span>
          </div>
          <span v-if="comment.childrenCount > 0" class="comment-action view-replies-action" :class="{ expanded: comment.showReplies }" @click="handleViewReplies(comment.commentId)">
            <span>查看回复</span>
            <img src="/src/assets/icons/pull.svg" class="action-icon" />
          </span>
        </div>
        
        <div v-if="replyTargetComment && replyTargetComment.commentId === comment.commentId" class="reply-input-wrapper">
          <input 
            type="text" 
            :value="replyContent" 
            @input="$emit('reply-content-change', $event.target.value)"
            placeholder="输入回复内容..." 
            class="reply-input"
            @keyup.enter="$emit('send-reply')"
          />
          <button class="reply-submit-btn" @click="$emit('send-reply')">回复</button>
        </div>
        
        <div v-if="comment.showReplies && comment.replies && comment.replies.length > 0" class="reply-list">
          <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
            <div class="reply-header">
              <el-avatar :size="36" :src="reply.userAvatar" class="reply-avatar">
                <User v-if="!reply.userAvatar" />
              </el-avatar>
              <div class="reply-user-info">
                <div class="reply-user-header">
                  <span class="reply-username">{{ reply.username }}</span>
                  <span v-if="reply.svip" class="svip-badge small">SVIP</span>
                </div>
                <span class="reply-time">{{ reply.createTime }}</span>
              </div>
            </div>
            <div class="reply-content">
              <span v-if="reply.replyUsername && reply.rootId !== reply.parentId" class="reply-to-user">回复 {{ reply.replyUsername }}：</span>
              {{ reply.content }}
            </div>
            <div class="reply-actions">
              <span class="reply-action like-action" :class="{ liked: reply.isLiked }" @click="handleLikeComment(reply)">
                <img src="/src/assets/icons/like.svg" class="action-icon" />
                <span>{{ reply.likeCount }}</span>
              </span>
              <span class="reply-action reply-action-btn" :class="{ active: replyTargetComment && replyTargetComment.commentId === reply.commentId }" @click="handleReplyComment(reply)">
                <img src="/src/assets/icons/reply.svg" class="action-icon" />
                <span>回复</span>
              </span>
            </div>
            
            <div v-if="replyTargetComment && replyTargetComment.commentId === reply.commentId" class="reply-input-wrapper reply-reply-input">
              <input 
                type="text" 
                :value="replyContent" 
                @input="$emit('reply-content-change', $event.target.value)"
                placeholder="输入回复内容..." 
                class="reply-input"
                @keyup.enter="$emit('send-reply')"
              />
              <button class="reply-submit-btn" @click="$emit('send-reply')">回复</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoadingMore" class="loading-more">
        <span class="loading-icon">🔄</span>
        <span>加载中...</span>
      </div>
      <div v-else-if="hasMore && comments.length > 0" class="load-more-btn" @click="$emit('load-more')">
        <span>查看更多评论</span>
      </div>
      <div v-else-if="!hasMore && comments.length > 0" class="no-more">
        <span>— 已经到底了 —</span>
      </div>
      <div v-else-if="!isLoadingMore && comments.length === 0" class="no-more">
        <span>暂无评论，快来发表第一条评论吧</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getSongComments, likeComment } from '@/api/comment'
import { getUserAvatar } from '@/utils/asset'

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  songId: {
    type: Number,
    required: true
  },
  replyTargetComment: {
    type: Object,
    default: null
  },
  replyContent: {
    type: String,
    default: ''
  },
  isLoadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['reply', 'reply-content-change', 'send-reply', 'load-more', 'refresh'])

const router = useRouter()
const commentListRef = ref(null)

const findCommentRecursively = (commentId, commentsList) => {
  for (const comment of commentsList) {
    if (comment.commentId === commentId) {
      return comment
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentRecursively(commentId, comment.replies)
      if (found) return found
    }
  }
  return null
}

const handleViewReplies = async (commentId) => {
  const comment = findCommentRecursively(commentId, props.comments)
  if (!comment) return
  
  if (comment.showReplies) {
    comment.showReplies = false
    return
  }
  
  if (!comment.replies) {
    comment.replies = []
  }
  
  try {
    const res = await getSongComments(props.songId, {
      rootId: commentId,
      firstId: 0
    })
    if (res.data && res.data.list) {
      comment.replies = res.data.list.map(reply => ({
        commentId: reply.commentId,
        userId: reply.userId,
        username: reply.username || '匿名用户',
        userAvatar: getUserAvatar(reply.userAvatar),
        content: reply.content,
        createTime: reply.createTime,
        likeCount: reply.likeCount || 0,
        isLiked: reply.isLiked ?? reply.isLike ?? false,
        childrenCount: reply.childrenCount || 0,
        hasChildren: Boolean(reply.hasChildren),
        replyUsername: reply.replyUsername || '',
        parentId: reply.parentId ?? 0,
        rootId: reply.rootId ?? comment.commentId,
        showReplies: false,
        replies: []
      }))
      comment.showReplies = true
    }
  } catch (error) {
    console.error('获取回复失败', error)
    ElMessage.error('获取回复失败')
  }
}

const handleLikeComment = async (comment) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }
  
  const targetLiked = !comment.isLiked
  const targetLikeStatus = targetLiked ? 1 : 0
  
  try {
    await likeComment(comment.commentId, targetLikeStatus)
    comment.isLiked = targetLiked
    comment.likeCount += targetLiked ? 1 : -1
    if (comment.likeCount < 0) {
      comment.likeCount = 0
    }
  } catch (error) {
    console.error('点赞失败', error)
    ElMessage.error('操作失败')
  }
}

const handleReplyComment = (comment) => {
  emit('reply', comment)
}

defineExpose({
  commentListRef
})
</script>

<style scoped>
.comment-list-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.comment-list {
  padding: 0 20px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar {
  background: linear-gradient(135deg, #667eea 0%, #409eff 100%);
  flex-shrink: 0;
}

.comment-user-info {
  flex: 1;
}

.comment-user-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-username {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

.comment-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.7;
  margin-bottom: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-to-user {
  color: #909399;
  font-weight: 400;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-actions-left {
  display: flex;
  gap: 24px;
}

.comment-action {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.comment-action:hover {
  color: #409eff;
}

.comment-action:hover .action-icon {
  filter: brightness(0) saturate(100%) invert(43%) sepia(90%) saturate(407%) hue-rotate(183deg) brightness(101%) contrast(101%);
}

.reply-action.active {
  color: #409eff;
}

.reply-action.active .action-icon {
  filter: brightness(0) saturate(100%) invert(43%) sepia(90%) saturate(407%) hue-rotate(183deg) brightness(101%) contrast(101%);
}

.action-icon {
  margin-top: 3px;
  font-size: 21px;
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
}

.view-replies-action .action-icon {
  transition: transform 0.2s ease;
  filter: brightness(0.6);
}

.view-replies-action.expanded .action-icon {
  transform: rotate(180deg);
}

.reply-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 0;
}

.reply-reply-input {
  background: transparent;
}

.reply-input {
  flex: 1;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.reply-input:focus {
  border-color: #909399;
}

.reply-submit-btn {
  height: 32px;
  padding: 0 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
}

.reply-submit-btn:hover {
  background: #66b1ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.like-action.liked {
  color: #ef4444;
}

.like-action.liked .action-icon {
  filter: brightness(0) saturate(100%) invert(21%) sepia(75%) saturate(7451%) hue-rotate(359deg) brightness(95%) contrast(106%);
}

.reply-list {
  margin-top: 16px;
  padding-left: 56px;
}

.reply-item {
  padding: 14px 0;
  border-bottom: 1px solid #f8f8f8;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.reply-avatar {
  background: linear-gradient(135deg, #667eea 0%, #409eff 100%);
  flex-shrink: 0;
}

.reply-user-info {
  flex: 1;
}

.reply-user-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.reply-username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: 20px;
}

.reply-action {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.reply-action:hover {
  color: #409eff;
}

.reply-action:hover .action-icon {
  filter: brightness(0) saturate(100%) invert(43%) sepia(90%) saturate(407%) hue-rotate(183deg) brightness(101%) contrast(101%);
}

.reply-action-btn.active {
  color: #409eff;
}

.reply-action-btn.active .action-icon {
  filter: brightness(0) saturate(100%) invert(43%) sepia(90%) saturate(407%) hue-rotate(183deg) brightness(101%) contrast(101%);
}

.reply-action.liked {
  color: #ef4444;
}

.reply-action.liked .action-icon {
  filter: brightness(0) saturate(100%) invert(21%) sepia(75%) saturate(7451%) hue-rotate(359deg) brightness(95%) contrast(106%);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.load-more-btn {
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.load-more-btn:hover {
  color: #606266;
}

.no-more {
  text-align: center;
  padding: 16px;
  color: #c0c4cc;
  font-size: 13px;
}
</style>