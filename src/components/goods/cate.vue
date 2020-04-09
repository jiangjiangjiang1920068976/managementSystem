<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type='primary' @click='addFenLei'>添加分类</el-button>
      </el-row>
    <!-- 表格 -->
    <tree-table class='tableMargin' :data="cateList" :columns="columns" show-index index-text='#' :selection-type='false' :expand-type='false' border>
      <template slot='isok' slot-scope='scope'>
        <i class='el-icon-success' v-if='scope.row.cat_deleted === false' style='color: lightgreen;'></i>
        <i class='el-icon-error' v-else style='color: red;'></i>
      </template>
      <template slot='order' slot-scope='scope'>
        <el-tag v-if='scope.row.cat_level === 0' size='mini'>一级</el-tag>
        <el-tag v-else-if='scope.row.cat_level === 1' size='mini' type='success'>二级</el-tag>
        <el-tag v-else size='mini' type='warning'>三级</el-tag>
      </template>
      <template slot='caozuo'>
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      </template>
    </tree-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 7]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 点击添加分类弹出对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="fenleiDialogVisible"
      width="50%"
      @close='closeFenlei'>
      <el-form :model="fenleiForm" :rules="fenleiRules" ref="fenleiForm" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="fenleiForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="cascaderValue"
            :options="parentList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fenleiDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'caozuo'
        }
      ],
      fenleiDialogVisible: false,
      fenleiForm: {
        // 添加父类分类名称
        cat_name: '',
        // 父类分类id
        cat_pid: 0,
        // 父类分类等级
        cat_level: 0
      },
      fenleiRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentList: [],
      cascaderValue: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败!')
      this.cateList = res.data.result
      this.total = res.data.total
      console.log(this.cateList)
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮添加对话框
    addFenLei() {
      this.getParentList()
      this.fenleiDialogVisible = true
    },
    // 获取父级分类的列表
    async getParentList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败!')
      this.parentList = res.data
    },
    // 选项卡发生变化触发这个函数
    handleChange() {
      if (this.cascaderValue.length > 0) {
        // 分类名称父级的id
        this.fenleiForm.cat_pid = this.cascaderValue[this.cascaderValue.length - 1]
        // 当前分类等级赋值
        this.fenleiForm.cat_level = this.cascaderValue.length
        return
      } else {
        this.fenleiForm.cat_pid = 0
        this.fenleiForm.cat_level = 0
      }
      console.log(this.cascaderValue)
    },
    // 关闭弹框 重置
    closeFenlei() {
      this.$refs.fenleiForm.resetFields()
      this.cascaderValue = []
      this.fenleiForm.cat_level = 0
      this.fenleiForm.cat_pid = 0
    },
    // 添加分类
    addCate() {
      this.$refs.fenleiForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.fenleiForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败!')
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.fenleiDialogVisible = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.tableMargin {
  margin-top: 20px;
}
.el-cascader {
  width: 100%
}
</style>
