<template>
  <div ref="ganttRef" id="gantt_here" class="gantt-main" style='width:100%; height:100%;'></div>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits,nextTick } from "vue";
import dayjs from 'dayjs'
import { gantt as dhtmlxgantt } from "dhtmlx-gantt";
import 'dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css'
import { useCloned } from '@vueuse/core'
const emit = defineEmits(['onTaskDblClick'])
console.log(dhtmlxgantt);
const ganttRef = ref(null);
const props = defineProps({
  data: {
    type: Array,
    default: []
  },
  links: {
    type: Array,
    default: [
      // { id: 1, source: 1, target: 2, type: "1" },
      // { id: 2, source: 2, target: 3, type: "0" }
    ]
  },
  borders: {
    type: String
  },
  cellHeight: {
    type: Number,
  },
  columns: {
    type: Array
  },
  scales: {
    type: Array,
    default: () => [
      { unit: "day", step: 1, format: "%m-%d" }
      // { unit: "month", step: 1, format: "%F, %Y" },
      // {
      //   unit: "week", step: 1, format: function (date) {
      //     return "Week #" + gantt.date.getWeek(date);
      //   }
      // },
      // {
      //   unit: "day", step: 1, format: "%D", css: function (date) {
      //     if (!gantt.isWorkTime({ date: date, unit: "day" })) {
      //       return "weekend"
      //     }
      //   }
      // }
    ]
  },
});
//初始化甘特图
const initGantt = () => {
  dhtmlxgantt.config.grid_width = 350
  dhtmlxgantt.config.add_column = false //添加符号

  //时间轴图表中，如果不设置，只有行边框，区分上下的任务，设置之后带有列的边框，整个时间轴变成格子状。
  dhtmlxgantt.config.autofit = false
  dhtmlxgantt.config.row_height = 60
  dhtmlxgantt.config.bar_height = 34
  // dhtmlxgantt.config.fit_tasks = true //自动延长时间刻度，以适应所有显示的任务
  dhtmlxgantt.config.auto_types = true //将包含子任务的任务转换为项目，将没有子任务的项目转换回任务
  dhtmlxgantt.config.date_format = "%Y-%m-%d %H:%i"; //甘特图时间格式
  dhtmlxgantt.config.readonly = false //是否只读
  dhtmlxgantt.i18n.setLocale('cn') //设置语言
  dhtmlxgantt.config.start_on_monday = true;//是否从周一显示起始时间---右侧条形图
  if (props.scales?.length) {
    dhtmlxgantt.config.scales = props.scales //设置时间刻度
  }
  dhtmlxgantt.config.grid_resize = true;
  dhtmlxgantt.config.drag_move = false;

  dhtmlxgantt.init(ganttRef.value)
  dhtmlxgantt.attachEvent("onAfterLinkAdd", function (id, item) {
    //any custom logic here
    console.log("onAfterLinkAdd", id, item);
    //     item:{
    //     "source": "WBS2401040073", 
    //     "target": "WBS2401040076",
    //     "type": "1", // 0：结束-开始；1：开始-开始；2：结束-结束；3：开始-结束；
    //     "id": 1705981833855
    // }
  });
  // dhtmlxgantt.attachEvent('onAfterTaskDrag', (id, mode, e) => {
  //   console.log('onAfterTaskDrag', id, mode);
  //   const curData = ganttData.value.find(item => item.id === id)
  //   console.log({...curData});
  //   console.log(dayjs(curData?.start_date).format("YYYY-MM-DD HH:mm:ss"));
  //   console.log(dayjs(curData?.end_date).format("YYYY-MM-DD HH:mm:ss"));
  //   switch (mode) {
  //     case 'resize': //拖动起止时间

  //       break;
  //     case 'progress ': //拖动进度

  //       break;
  //     case 'move': //移动任务

  //       break;

  //   }
  // })
  // dhtmlxgantt.parse({
  //   data: props.data,
  //   links: props.links,
  // })
}
dhtmlxgantt.attachEvent("onAfterTaskUpdate", (id, item) => {
  console.log('onAfterTaskUpdate', id, { ...item });
})
dhtmlxgantt.attachEvent("onLinkDblClick", function (id, e) {
  //any custom logic here
  return false; //阻止默认双击事件
});
dhtmlxgantt.attachEvent("onTaskDblClick", function (id, e) {
  //any custom logic here
  // console.log("onTaskDblClick", id, e);
  emit('onTaskDblClick', id)
  return false;
});
const ganttData = ref([])
watch(() => props.columns, (newVal) => {
  if (newVal?.length) {
    dhtmlxgantt.config.columns = props.columns //设置列
  }
}, {
  deep: true,
  immediate: true
})
watch(() => props.data, (newVal, oldVal) => {
  if (newVal?.length) {
    ganttData.value = useCloned(newVal).cloned.value
  } else {
    ganttData.value = []
  }
  dhtmlxgantt.parse({
    data: ganttData.value,
    links: props.links,
  })
}, {
  deep: true,
  immediate: true
})
onMounted(() => {
  initGantt();
})
</script>

<style lang="scss" scoped>
.gantt-main {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
