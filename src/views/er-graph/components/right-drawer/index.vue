

<script setup lang="ts">
import { computed } from 'vue';


defineOptions({ name: 'RightDrawer' })
const props = defineProps({
  currentCell: null
})

const cellId = computed(() => props?.currentCell?.id)

</script>


<template>
  <aside class="right-drawer">
    {{ cellId }}
  </aside>
</template>

<style scoped>
.right-drawer {
  width: 100px;
  background-color: #fff;
  border-top: 1px solid #eee;
}
</style>