<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter='20'>
        <el-col :span='8'>
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear='getGoodList'>
            <el-button slot="append" icon="el-icon-search" @click='getGoodList'></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <el-button type='primary' @click='addSp'>添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data='goodList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='商品名称' prop='goods_name'></el-table-column>
        <el-table-column label='商品价格' prop='goods_price' width='80px'></el-table-column>
        <el-table-column label='商品重量' prop='goods_weight' width='80px'></el-table-column>
        <el-table-column label='创建时间' prop='add_time' width='140px'>
          <template slot-scope='scope'>
            {{ scope.row.add_time | dataFormmat }}
          </template>
        </el-table-column>
        <el-table-column label='操作' width='190px'>
          <template slot-scope='scope'>
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeList(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goodList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    async getGoodList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
      console.log(this.goodList)
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    removeList(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.$http.delete('goods/' + id).then(result => {
            if (result.data.meta.status !== 200) return this.$message.error('删除用户失败')
            this.getGoodList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    addSp() {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
