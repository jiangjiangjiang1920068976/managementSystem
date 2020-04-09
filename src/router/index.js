import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import MainPage from '../components/mainPage.vue'
import users from '../components/users/users.vue'
import rights from '../components/power/rights.vue'
import roles from '../components/power/roles.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/mainPage', children: [{ path: '/mainPage', component: MainPage }, { path: '/users', component: users }, { path: '/rights', component: rights }, { path: '/roles', component: roles }] }
]

const router = new VueRouter({
  routes
})
// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
