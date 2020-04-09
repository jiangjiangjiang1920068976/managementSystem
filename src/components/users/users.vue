<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
        <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear='getUsersList'>
            <el-button slot="append" icon="el-icon-search" @click='getUsersList'></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type='primary' @click='addDialogVisible = true'>添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="usersList" border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
            <!-- 作用域插槽 scope.row是整个列表的信息 -->
          <template slot-scope='scope'>
            <el-switch v-model="scope.row.mg_state" @change='userStateChanged(scope.row)'>
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width='180px'>
          <template slot-scope='scope'>
           <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row.id)"></el-button>
           <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialog(scope.row.id)"></el-button>
           <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
             <el-button type="warning" icon="el-icon-setting" size="mini" @click='assignRoles(scope.row)'></el-button>
           </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 3, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 点击添加用户弹出对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close='closeDialogVisible'>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="ruleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击按钮弹出编辑对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close='closeEditDialog'>
      <el-form :model="editForm" :rules="editRules" ref="editRef" label-width="70px">
        <el-form-item label="用户名称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击分配权限弹出对话框 -->
    <el-dialog title="分配角色" :visible.sync="usersFpqx" width="50%" @close='closeUserFpjs'>
      <div>
        <p>当前的用户：{{usersInfo.username}}</p>
        <p>当前的角色：{{usersInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="value" placeholder="请选择">
           <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
           </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="usersFpqx = false">取 消</el-button>
        <el-button type="primary" @click="determineAllocation">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/
      if (regMobile.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      usersList: [],
      total: 0,
      queryInfo: {
        // 搜索关键字 做双向数据绑定
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 3
      },
      addDialogVisible: false,
      ruleForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 查询到的用户信息数据
      editForm: {},
      usersFpqx: false,
      // 用户信息
      usersInfo: {},
      // 角色列表
      roleList: [],
      value: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    // 获取用户列表
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.usersList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 分页功能
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUsersList()
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getUsersList()
    },
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功')
    },
    // 添加添加用户表单关闭事件 关闭重置内容
    closeDialogVisible() {
      this.$refs.ruleForm.resetFields()
    },
    // 点击确定 添加新用户
    addUser() {
      // 先对表单校验
      this.$refs.ruleForm.validate(valid => {
        if (!valid) return
        this.$http.post('users', this.ruleForm).then(result => {
          if (result.data.meta.status !== 201) {
            this.$message.error('添加用户失败!')
          }
          this.$message.success('添加用户成功')
          // 隐藏对话框
          this.addDialogVisible = false
          // 重新加载列表
          this.getUsersList()
        })
      })
    },
    // 根据id修改用户数据
    async editDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    closeEditDialog() {
      this.$refs.editRef.resetFields()
    },
    // 编辑用户
    editUser() {
      this.$refs.editRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) return this.$message.error('更新用户信息失败')
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新加载列表
        this.getUsersList()
        this.$message.success('用户信息修改成功')
      })
    },
    // 删除用户
    removeDialog(id) {
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
          this.$http.delete('users/' + id).then(result => {
            if (result.data.meta.status !== 200) return this.$message.error('删除用户失败')
            this.getUsersList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 获取到所有角色信息
    async assignRoles(usersInfo) {
      this.usersInfo = usersInfo
      console.log(this.usersInfo)
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败!')
      this.roleList = res.data
      console.log(this.roleList)
      this.usersFpqx = true
    },
    // 点击确定按钮 分配角色
    async determineAllocation() {
      if (!this.value) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.usersInfo.id}/role`, { rid: this.value })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.usersFpqx = false
      this.getUsersList()
    },
    closeUserFpjs() {
      this.value = ''
    }
  }
}
</script>
<style lang="less" scoped>
</style>
