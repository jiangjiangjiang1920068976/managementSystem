<template lang="">
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon>
      </el-alert>
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addRules" ref="ruleForm" label-width="100px" label-position='top'>
        <el-tabs v-model='activeIndex' :tab-position="'left'" :before-leave='beforeLeave' @tab-click='changeTabs'>
          <!-- name会将每一项的tab值传给v-model='activeIndex' 使el-tab-pane和el-step保持一致 -->
          <el-tab-pane label="基本信息" name='0'>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type='number'>
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type='number'>
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type='number'>
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat" type='number'>
              <!-- :props里必须指定value label children -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="goodsList"
                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children'}"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name='1'>
            <el-form-item :label="item.attr_name" v-for='item in manyCanshu' :key='item.attr_id'>
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for='(cb, i) in item.attr_vals' :key='i' border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name='2'>
            <el-form-item :label="item.attr_name" v-for='item in onlyCanshu' :key='item.attr_id'>
              <el-input v-model='item.attr_vals'></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name='3'>
            <!-- action表示要上传后台的API地址 必须要完整的 这是上传给后台数据库的 不是上传给本地的8080端口 -->
            <!-- 上传控件没有使用axios发送ajax请求 它是使用自己封装的 所以要使用headers -->
            <!-- 上传到数据库之后还要将商品信息添加到本地中 -->
            <!-- on-success 图片上传成功调用该方法 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers='headerObj'
              :on-success='handleSuccess'>
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name='4'>
            <quill-editor v-model='addForm.goods_introduce'></quill-editor>
            <el-button type='primary' class='btn-primary' @click='add'>添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src='previewPath' class='previewImg'>
    </el-dialog>
  </div>
</template>
<script>
// 导入lodash 之后只要一调用就可以深拷贝
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      goodsList: [],
      manyCanshu: [],
      onlyCanshu: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewDialogVisible: false
    }
  },
  created() {
    this.goodsCateList()
  },
  methods: {
    async goodsCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品数据失败!')
      this.goodsList = res.data
      console.log(res.data)
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // beforeLeave具体可以看elementui tabs使用
    beforeLeave(activeName, oldActiveName) {
    // 如果当前页为第0页并且选中的不是三级分类执行
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类!')
        return false
      }
    },
    async changeTabs() {
      // 判断当前页name是否为1 如果是1则进入到商品参数中
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败!')

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyCanshu = res.data
        console.log(this.manyCanshu)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败!')
        this.onlyCanshu = res.data
        console.log(this.onlyCanshu)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作 自带参数
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      // x指的是this.addForm.pics数组里的每一项
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    handleSuccess (response) {
      const picture = { pic: response.data.tmp_path }
      this.addForm.pics.push(picture)
      console.log(this.addForm)
    },
    add() {
      // 添加商品之前的表单预验证
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        // 执行添加的业务逻辑
        // lodash cloneDeep(obj)
        // 深拷贝一个新的对象  因为这里调用api接口需要使用的是以逗号分隔的字符串 而级联选择器需要的是数组 所以冲突 解决办法 使用深拷贝一个一模一样的对象
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 因为API接口要传入attr数组 并且只包含 attr_id和attr_vals 所以要进行以下处理
        // 处理静态参数
        this.manyCanshu.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyCanshu.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
        console.log(form)
      })
    }
  },
  computed: {
    cateId() {
      // goods_cat用于存放分类选中文本框的值的id
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btn-primary {
  margin-top: 10px;
}
</style>
