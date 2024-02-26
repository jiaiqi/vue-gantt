<template>
  <div class="drawer_container">
    <div class="drawer_title">节点</div>
    <div class="drawer_wrap">
      <div class="node-group">
        <div class="node-item" @mousedown="startDrag('Container', $event)">
          容器
        </div>
        <div class="node-item" @mousedown="startDrag('ER', $event)">
          er图
        </div>
        <!-- <div class="node" title="圆形节点" @mousedown="startDrag('Circle', $event)">
          <i class="iconfont icon-circle"></i>
        </div>
        <div class="node" title="正方形节点" @mousedown="startDrag('Rect', $event)">
          <i class="iconfont icon-square"></i>
        </div>
        <div class="node" title="条件节点">
          <i class="iconfont icon-square rotate-square" @mousedown="startDrag('polygon', $event)"></i>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "LeftDrawer"
})
const emit = defineEmits(["start-drag"]);

const startDrag = (type: string, event: Event) => {
  emit("start-drag", type, event);
};
</script>

<style scoped lang="scss">
.drawer_container {
  width: 200px;
  min-width: 200px;
  border-right: 1px solid #eee;

  .drawer_title {
    border-bottom: 1px solid #e8eaec;
    box-sizing: border-box;
    padding: 14px 16px;
    color: #333;
    font-size: 16px;
  }

  .drawer_wrap {
    box-sizing: border-box;
    padding: 20px;

    .node-group {
      display: flex;
      flex-wrap: wrap;

      .node-item {
        width: 100%;
        margin-bottom: 10px;
        line-height: 50px;
        border: 1px solid #eee;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        // &:active{
        //   transform: translate(1px,1px);
        // }
      }

      .node {
        width: calc(100% / 3);
        text-align: center;
        line-height: 80px;
        cursor: move;

        .iconfont {
          font-size: 40px;
        }

        &:hover {
          background-color: rgba($color: #eee, $alpha: 0.6);
        }

        .rotate-square {
          display: inline-block;
          transform: rotate(45deg);
        }
      }
    }
  }
}
</style>
