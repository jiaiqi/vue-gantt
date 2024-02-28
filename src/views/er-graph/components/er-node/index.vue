<template>
  <div class="er-entity" ref="erEntity">
    <div class="entity-header">
      <div class="btn" @click="changeCollapses">
        <el-icon>
          <Plus v-if="collapses" />
          <Minus v-else />
        </el-icon>
      </div>
      <span :contenteditable="selected && onTitleEdit ? 'plaintext-only' : 'false'" style="flex: 1;min-height: 10px;"
        @blur="onTitleChange" @click="onTitleEdit = true">{{ nodeTitle
        }}</span>
      <div class="btn-light" @click="addPort">
        <el-icon>
          <Plus />
        </el-icon>
      </div>
    </div>
    <div class="entity-container" :class="{ collapses }">
      <div class="entity-container-item" v-for="item in colsList"
        :contenteditable="selected && item.onEdit ? 'plaintext-only' : 'false'" @blur="onColumnChange($event, item)"
        @click="item.onEdit = true">
        <div class="text">{{ item.label }}</div>
        <div class="text">{{ item.type }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Plus, Minus } from '@element-plus/icons-vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'er-entity-node',
  inject: ['getNode'],
  components: {
    Plus, Minus
  },
  props: {
    onSelected: Boolean
  },
  data() {
    return {
      node: null,
      collapses: false,
      colsList: [],
      selected: false,
      onTitleEdit: false
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
      this.node.setData({ title: e?.target?.innerText })
      this.onTitleEdit = false
    },
    onColumnChange(e, col) {
      const valArr = e?.target?.innerText?.split('\n')
      console.log(valArr, '\onColumnChange', col);
      this.colsList.forEach(item => {
        if (item.id && item.id === col.id) {
          item.label = valArr[0]
          item.type = valArr[1]
          item.onEdit = false
        }
      })
      this.node.setData({ colsList: JSON.parse(JSON.stringify(this.colsList)) })
    },
    resizeNode() {
      this.$nextTick(() => {
        this.node?.resize?.(this.$refs.erEntity?.clientWidth, this.$refs.erEntity?.clientHeight)
      })
    },
    addPort() {
      const item = {
        id: new Date().getTime(),
        label: "测试",
        column: "test",
        type: "string",
      }
      const colsList = [...this.colsList, item]
      this.node.setData({ colsList })
      this.node.addPort({
        id: item.id,
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
    this.node = node
    this.colsList = (node.getData()?.colsList || []).map(item => {
      item.onEdit = false;
      return item
    })
    console.log(node)
    this.resizeNode()
    node.on('change:data', ({cell,previous,current}) => {
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
        min-width: 50px;
      }
    }
  }
}
</style>