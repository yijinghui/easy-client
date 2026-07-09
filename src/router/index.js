import { createRouter, createWebHistory } from 'vue-router'
import LayoutView from '@/views/layout/index.vue'
import HomeView from '@/views/home/index.vue'
import RankView from '@/views/rank/index.vue'
import FavoriteView from '@/views/favorite/index.vue'
import RecentView from '@/views/recent/index.vue'
import CommentView from '@/views/comment/index.vue'
import SearchView from '@/views/search/index.vue'
import LoginView from '@/views/login/index.vue'
import RegisterView from '@/views/login/register/index.vue'
import ResetView from '@/views/login/reset/index.vue'
import RoomView from '@/views/room/index.vue'
import RoomLiveView from '@/views/room/live.vue'
import UserView from '@/views/user/index.vue'
import PlaylistView from '@/views/playlist/index.vue'
import PlaylistEditView from '@/views/playlist/edit.vue'
import { getAuthToken } from '@/utils/auth'




const routes = [
  {
    path: '/',
    name: '',
    component: LayoutView,
    redirect: '/home', //重定向
    children: [
      {path: '/home',name: 'home',component: HomeView},
      {path: '/rank',name: 'rank',component: RankView},
      {path: '/room',name: 'room',component: RoomView},
      {path: '/favorite',name: 'favorite',component: FavoriteView},
      {path: '/recent',name: 'recent',component: RecentView, meta: { requiresAuth: true }},
      {path: '/search', name: 'search', component: SearchView},
      {path: '/comment/:songId', name: 'comment', component: CommentView},
      {path: '/user/:userId', name: 'userDetail', component: UserView, meta: { requiresAuth: true }},
{path: '/user', name: 'user', component: UserView, meta: { requiresAuth: true }},
      {path: '/playlist/edit/:id', name: 'playlistEdit', component: PlaylistEditView, meta: { requiresAuth: true }},
      {path: '/playlist/:id', name: 'playlist', component: PlaylistView},
    ]
  },
  {path: '/login',name: 'login',component: LoginView},
  {path: '/register',name: 'register',component: RegisterView},
  {path: '/reset',name: 'reset',component: ResetView},
  {path: '/room/live/:roomId',name: 'roomLive',component: RoomLiveView, meta: { requiresAuth: true }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = getAuthToken()
    if (!token) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
