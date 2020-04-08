<template lang="">
  <el-container class='home_container'>
    <el-header class='el-header'>
      <span>电商后台管理系统</span>
      <el-button type="info" @click='loginOut'>退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isFold ? '64px' : '200px'" class='el-aside'>
        <div class='aside_button' @click='Fold'>|||</div>
        <el-menu background-color='#e4f5ef' text-color='#2c3e50' active-text-color="#42b983" unique-opened :collapse='isFold' :collapse-transition='false' router :default-active='activePath'>
          <el-submenu :index="item.id+''" v-for='item in menuList' :key='item.id'>
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/'+child.path" v-for='child in item.children' :key='child.id' @click="saveState('/' + child.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{child.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main class='el-main'>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menuList: [],
      icons: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-mn_kongjian_fill',
        101: 'iconfont icon-shangpingouwudai2',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isFold: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    loginOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单列表
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    // 切换菜单的折叠和展开
    Fold () {
      this.isFold = !this.isFold
    },
    saveState (path) {
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    }
  }
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #bbe6d6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 20px;
  }
}
.el-aside {
  .aside_button {
    line-height: 30px;
    text-align: center;
    letter-spacing: 0.2em;
    font-size: 10px;
    background-color: #fff;
    border-radius: 16px;
    border: 1px solid #e4f5ef;
    cursor: pointer;
  }
  background-color: #e4f5ef;
  .el-menu {
    border-right: 0;
  }
}
.iconfont {
  margin-right: 10px;
}
</style>
