<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type='primary'>添加角色</el-button>
      </el-row>
      <el-table :data='rolesList' border stripe>
        <!-- 展开列 -->
        <el-table-column type='expand'>
          <template slot-scope='scope'>
            <el-row :class="['borderBottom', i1 === 0 ? 'borderTop' : '', 'vcenter']" v-for='(item1, i1) in scope.row.children' :key='item1.id'>
              <!-- 渲染一级权限 -->
              <el-col :span='5'>
                <el-tag closable @close='removeId(scope.row, item1.id)'>{{item1.authName}}</el-tag>
                <i class='el-icon-caret-right'></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span='19'>
                <el-row :class="[i2 === 0 ? '' : 'borderTop', 'vcenter']" v-for='(item2, i2) in item1.children' :key='item2.id'>
                  <el-col :span='6'>
                    <el-tag type='success' closable @close='removeId(scope.row, item2.id)'>{{item2.authName}}</el-tag>
                    <i class='el-icon-caret-right'></i>
                  </el-col>
                  <el-col :span='18'>
                    <el-tag type='warning' v-for='(item3) in item2.children' :key='item3.id' closable @close='removeId(scope.row, item3.id)'>{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type='index'></el-table-column>
        <el-table-column label='角色名称' prop='roleName'></el-table-column>
        <el-table-column label='角色描述' prop='roleDesc'></el-table-column>
        <el-table-column label='操作' width='300px'>
          <template slot-scope='scope'>
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click='fpqxForm(scope.row)'>分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限弹框 -->
    <el-dialog title="分配权限" :visible.sync="fpqx" width="50%" @close="closeFpqx">
      <el-tree :data="rolesList" ref='treeRef' :props="treeProps" show-checkbox default-expand-all node-key='id' :default-checked-keys='defkeys'></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fpqx = false">取 消</el-button>
        <el-button type="primary" @click="modifyRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      fpqx: false,
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中节点id的数组
      defkeys: [],
      // 当前即将分配权限角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取权限列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败!')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    removeId(roles, rightId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.$http.delete(`roles/${roles.id}/rights/${rightId}`).then(result => {
            if (result.data.meta.status !== 200) return this.$message.error('删除用户失败')
            // console.log(result.data)
            // 将最新的child列表获取到
            roles.children = result.data.data
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击分配权限弹出对话框
    async fpqxForm(roles) {
    // 拿到点击分配权限的id
      this.roleId = roles.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!')
      }
      // 将最新的权限赋值过去
      this.rolesList = res.data
      // 加载到所有已有的权限
      this.getQx(roles, this.defkeys)
      this.fpqx = true
    },
    // 将已设置的权限同步到弹出框中
    getQx(roles, arr) {
      if (!roles.children) {
        return arr.push(roles.id)
      }
      roles.children.forEach(item => {
        this.getQx(item, arr)
      })
    },
    // 取消设置权限时数据跟原来同步
    closeFpqx() {
      console.log(this.rolesList)
      this.defkeys = []
      this.getRolesList()
    },
    // 点击确定按钮修改权限
    async modifyRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败!')
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.fpqx = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
    margin: 8px;
}
.borderTop {
  border-top: 1px solid #eee;
}
.borderBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
