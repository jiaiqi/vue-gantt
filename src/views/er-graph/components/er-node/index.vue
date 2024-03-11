<template>
  <div class="er-entity" ref="erEntity">
    <div class="entity-header" :title="nodeTitle">
      <div class="btn" @click="changeCollapses">
        <el-icon>
          <Plus v-if="collapses" />
          <Minus v-else />
        </el-icon>
      </div>
      <span :contenteditable="selected && onTitleEdit ? 'plaintext-only' : 'false'"
        style="flex: 1;min-height: 10px;white-space: nowrap;overflow: hidden;" @blur="onTitleChange" @click="onTitleEdit = true">{{
          nodeTitle
        }}</span>
      <div class="btn-light" @click="openAddDialog">
        <el-icon>
          <Plus />
        </el-icon>
      </div>
    </div>
    <div class="entity-container" :class="{ collapses }">
      <div class="entity-container-item" v-for="item in colsList"
        :contenteditable="selected && item.onEdit ? 'plaintext-only' : 'false'" @blur="onColumnChange($event, item)"
        @click="item.onEdit = true">
        <div class="text">{{ item.label || item._title || '' }}</div>
        <div class="text">{{ item.type || item._type || '' }}</div>
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" title="新增字段" width="500" append-to-body>
      <el-form :model="form">
        <el-form-item label="字段名" label-width="140px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="字段类型" label-width="140px">
          <el-input v-model="form.type" autocomplete="off" />
        </el-form-item>
        <!-- <el-form-item label="Zones" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addPort">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Plus, Minus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'er-entity-node',
  inject: ['getNode'],
  components: {
    Plus, Minus
  },
  data() {
    return {
      node: null,
      nodeData: null,
      collapses: false,
      colsList: [],
      selected: false,
      onTitleEdit: false,
      dialogFormVisible: false,
      form: {
        name: "",//字段名
        type: '',//字段类型
      }
    }
  },
  computed: {
    nodeTitle() {
      return this.node?.data?.title || ''
    },
  },
  methods: {
    onTitleChange(e) {
      console.log(e?.target?.innerText, '\nonTitleChange');
      this.node.setData({
        title: e?.target?.innerText,
        handler: {
          type: 'ernode:title:update',
          item: e?.target?.innerText
        }
      })
      this.onTitleEdit = false
      setTimeout(() => {
        this.node.setData({
          handler: null
        })
      }, 200);
    },
    onColumnChange(e, col) {
      const valArr = e?.target?.innerText?.split('\n')
      console.log(valArr, '\onColumnChange', col);
      const colsList = this.colsList.map(item => {
        const obj = { ...item }
        if (item._no && item._no === col._no) {
          obj.label = valArr[0]
          obj.type = valArr[1]
          obj.onEdit = false
        }
        return obj
      })
      this.node.setData({
        colsList: JSON.parse(JSON.stringify(colsList)),
        handler: {
          type: 'ernode:item:update',
          item: {
            ...col,
            _type: valArr[1],
            _title: valArr[0]
          }
        }
      })
      this.node.setData({
        handler: null
      })
    },
    resizeNode() {
      this.$nextTick(() => {
        this.node?.resize?.(this.$refs.erEntity?.clientWidth, this.$refs.erEntity?.clientHeight)
      })
    },
    openAddDialog() {
      this.dialogFormVisible = true
    },
    addPort() {
      this.dialogFormVisible = false
      const item = {
        _id: new Date().getTime(),
        _title: this.form.name,
        _type: this.form.type,
        _fk_obj_no: this.nodeData?.no,
      }
      const colsList = [...this.colsList, item]
      this.node.setData({
        colsList,
        handler: {
          type: 'ernode:item:add',
          item
        }
      })
      setTimeout(() => {
        this.node.setData({
          handler: null
        })
      }, 200);
      this.node.addPort({
        id: item._id,
        group: "list",
        data: {
          ...item
        },
        attrs: {
          portNameLabel: {
            // text: item.label,
          },
          portTypeLabel: {
            // text: item.type,
          },
        },
      })
      this.node = this.getNode()
      this.colsList = this.node.getData()?.colsList || []
      this.resizeNode()
      Object.keys(this.form).forEach(key => {
        this.form[key] = ''
      })
    },
    changeCollapses() {
      this.collapses = !this.collapses
      this.node.setData({
        collapses: this.collapses
      })
      this.resizeNode()
    }
  },
  mounted() {
    const node = (this as any).getNode()
    this.nodeData = node.getData()
    this.node = node
    this.colsList = (node.getData()?.colsList || []).map(item => {
      item.onEdit = false;
      return item
    })
    this.resizeNode()
    node.on('change:data', ({ cell, previous, current }) => {
      // 监听选中/取消选中
      console.log(current);
      this.selected = current?.selected
    })
  },
})
</script>

<style lang="scss" scoped>
.er-entity {
  --ratio: 2/3;
  --main-color: #2740f8;
  width: calc(160px * var(--ratio));
  box-sizing: border-box;


  .entity-header {
    height: calc(30px * var(--ratio));
    line-height: calc(30px * var(--ratio));
    background: var(--main-color);
    color: #fff;
    padding: 2px calc(10px * var(--ratio));
    box-sizing: border-box;

    text-align: center;
    font-size: calc(16px * var(--ratio));
    display: flex;
    justify-content: space-between;
    align-items: center;

    .btn {
      width: calc(22px * var(--ratio));
      height: calc(18px * var(--ratio));
      line-height: calc(18px * var(--ratio));
      background-color: #f5f5f5;
      border-radius: 2px;
      border: 1px solid #eee;
      color: #808080;
      font-size: calc(14px * var(--ratio));
      cursor: pointer;
    }

    .btn-light {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }

  .entity-container {
    border: 1px solid var(--main-color);
    min-height: 30px;
    box-sizing: border-box;

    &.collapses {
      min-height: 2px;
      height: 3px;
      overflow: hidden;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      padding: 0 5px;
      z-index: 200;
      height: calc(30px * var(--ratio));
      line-height: calc(30px * var(--ratio));
      box-sizing: border-box;
      border-bottom: 1px dashed var(--main-color);

      &:last-child {
        border-bottom: none;
      }

      .text {
        font-size: 10px;
        min-width: 30px;

        &:nth-child(2n) {
          text-align: right;
        }
      }
    }
  }
}
</style>