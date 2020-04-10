<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许三级分类设置相关参数！"
        type="warning"
        show-icon>
      </el-alert>
      <el-row>
        <el-col class='spanCol'>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="value"
            :options="catList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size='mini' :disabled='isBtnDisable' @click="paramsDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data='manyData' border stripe>
            <el-table-column type='expand'>
              <!-- 动态编辑标签 -->
              <template slot-scope='scope'>
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key='i' closable @close='closeTag(i,scope.row)'>{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='参数信息' prop='attr_name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialogClick(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size='mini' :disabled='isBtnDisable' @click="paramsDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data='onlyData' border stripe>
            <el-table-column type='expand'>
              <template slot-scope='scope'>
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key='i' closable @close='closeTag(i,scope.row)'>{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='参数信息' prop='attr_name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteDialogClick(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+Text"
      :visible.sync="paramsDialogVisible"
      width="50%"
      @close='closeParams'>
      <el-form :model="paramsForm" :rules="paramsRules" ref="paramsForm" label-width="100px">
        <el-form-item :label="Text" prop="attr_name">
          <el-input v-model="paramsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="paramsClick">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+Text"
      :visible.sync="editDialogVisible"
      width="50%"
      @close='closeEdit'>
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="100px">
        <el-form-item :label="Text" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click='editClick'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 存放所有获取到的数据
      catList: [],
      // 双向数据绑定
      value: [],
      activeName: 'many',
      manyData: [],
      onlyData: [],
      paramsDialogVisible: false,
      paramsForm: {
        attr_name: ''
      },
      paramsRules: {
        attr_name: [
          { required: true, message: '请输入参数信息', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数信息', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.categoryList()
  },
  methods: {
    async categoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.catList = res.data
      console.log(this.catList)
    },
    // 当弹出框的值发生改变时 执行该函数
    handleChange() {
      this.getData()
    },
    // tab栏切换触发
    handleClick() {
      console.log(this.activeName)
      this.getData()
    },
    // 切换tab得到不同的数据
    async getData() {
      if (this.value.length !== 3) {
        this.value = []
        this.manyData = []
        this.onlyData = []
        return this.$message.error('注意：只允许三级分类设置相关参数！')
      }
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
      // 遍历将数组按空组分割  使用三元表达式解决新增参数渲染标签为空的问题
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)

      // 根据不同的tab返回不同的数据  这个返回数据要放在后面不然会出错
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    closeParams() {
      this.$refs.paramsForm.resetFields()
    },
    paramsClick() {
      this.$refs.paramsForm.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.paramsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败!')
        this.$message.success('添加参数成功!')
        this.getData()
        this.paramsDialogVisible = false
      })
    },
    closeEdit() {
      this.$refs.editForm.resetFields()
    },
    // 点击按钮 显示修改对话框 传的参数取名不能为attr_id
    async editDialog(id) {
      // 查询当前参数的信息
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editClick() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败!')
        this.$message.success('修改参数成功!')
        this.getData()
        this.editDialogVisible = false
        console.log(this.catList)
      })
    },
    deleteDialogClick(id) {
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
          this.$http.delete(`categories/${this.cateId}/attributes/${id}`).then(result => {
            if (result.data.meta.status !== 200) return this.$message.error('删除用户失败')
            this.getData()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 文本框失去焦点触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.fengzhuanghanshu(row)
    },
    // 修改标签的操作 更新到数据库中
    async fengzhuanghanshu(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败!')
      this.$message.success('修改参数项成功!')
    },
    closeTag(i, row) {
      row.attr_vals.splice(i, 1)
      this.fengzhuanghanshu(row)
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    isBtnDisable() {
      if (this.value.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.value.length === 3) {
        return this.value[2]
      }
      return null
    },
    Text() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    panduanText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.spanCol {
  margin: 15px 0;
}
.el-tag {
  margin-right: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
