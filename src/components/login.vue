<template lang="">
    <div class='login_container'>
        <div class='login_box'>
          <img src='../assets/logo.png' />
          <el-form class='login_form' :model='loginForm' :rules="rules" ref='loginFormRef'>
            <el-form-item prop="username">
              <el-input prefix-icon='iconfont icon-user' v-model='loginForm.username'></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input prefix-icon='iconfont icon-password' v-model='loginForm.password' type='password'></el-input>
            </el-form-item>
            <el-form-item class='login_btns'>
              <el-button type='primary' @click='login'>登录</el-button>
              <el-button type='info' @click='reset'>重置</el-button>
            </el-form-item>
          </el-form>
        </div>
    </div>
</template>
<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(valid => {
        if (!valid) return
        this.$http.post('login', this.loginForm).then(result => {
          if (result.data.meta.status !== 200) return this.$message.error('登录失败')
          this.$message.success('登录成功')
          window.sessionStorage.setItem('token', result.data.data.token)
          this.$router.push('/home')
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: lightcoral;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 90px;
    height: 90px;
    background-color: #eee;
    border-radius: 50%;
    border: 10px solid #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
.login_form {
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 10px;
  box-sizing: border-box;
}
.login_btns {
  display: flex;
  justify-content: flex-end;
}
</style>
