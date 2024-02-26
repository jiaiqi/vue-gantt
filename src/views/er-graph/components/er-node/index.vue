<template>
  <div class="er-entity" ref="erEntity">
    <div class="entity-header">
      <div class="btn" @click="changeCollapses">
        <el-icon>
          <Plus v-if="collapses" />
          <Minus v-else />
        </el-icon>
      </div>
      <span>{{ nodeTitle }}</span>
      <div class="btn-light" @click="addPort">
        <el-icon>
          <Plus />
        </el-icon>
      </div>
    </div>
    <div class="entity-container" :class="{ collapses }">
      <div class="entity-container-item" v-for="item in colsList">
        <div class="text" contenteditable="true">{{ item.label }}</div>
        <div class="text" contenteditable="true">{{ item.type }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Plus, Minus } from '@element-plus/icons-vue'
import { useThrottledRefHistory } from '@vueuse/core'
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
      collapses: false,
      colsList: []
    }
  },
  computed: {
    nodeTitle() {
      return this.node?.data?.title || ''
    },
  },
  methods: {
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
    this.colsList = node.getData()?.colsList || []
    console.log(node)
    this.resizeNode()
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
      }
    }
  }
}
</style>