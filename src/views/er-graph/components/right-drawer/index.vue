

<script setup lang="ts">
import { computed } from 'vue';


defineOptions({ name: 'RightDrawer' })
const props = defineProps({
  currentCell: null
})

const cellId = computed(() => props?.currentCell?.id)

</script>


<template>
  <div class="right-drawer">
    {{ cellId }}
  </div>
</template>

<style scoped>
.right-drawer {
  width: 100px;
  background-color: #fff;
}
</style>