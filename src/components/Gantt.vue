<template>
  <div ref="ganttRef" id="gantt_here" class="gantt-main" style='width:100%; height:100%;'></div>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits, nextTick } from "vue";
import dayjs from 'dayjs'
import { gantt as dhtmlxgantt, gantt } from "dhtmlx-gantt";
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
      // { unit: "day", step: 1, format: "%m-%d" },
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

const zoomConfig = {
  levels: [
    {
      name: 'day',
      scale_height: 60,
      min_column_width: 40,
      scales: [
        // {
        //   unit: 'year',
        //   step: 1,
        //   format: '%Y年'
        // },
        { unit: 'day', step: 1, format: '%y年%m月%d日' },
        { unit: 'hour', step: 1, format: '%h时' },
      ]
    },
    {
      name: 'week',
      scale_height: 60,
      min_column_width: 35,
      scales: [
        // {
        //   unit: 'year',
        //   step: 1,
        //   format: '%Y年'
        // },
        {
          unit: 'week',
          step: 1,
          width: 150,
          format: function (date) {
            let dateToStr = gantt.date.date_to_str('%Y-%m-%d')
            let endDate = gantt.date.add(date, 6, 'day')
            // let endDate = gantt.date.add(date, -6, 'day')
            let weekNum = gantt.date.date_to_str('%W')(date) //第几周
            // return dateToStr(endDate) + ' 至 ' + dateToStr(date) + `(第${weekNum}周)`
            return dateToStr(date) + ' 至 ' + dateToStr(endDate) + `(第${weekNum}周)`
          }
        },
        {
          unit: 'day',
          step: 1,
          format: '%d', // + "周%D"
          css: function (date) {
            if (date.getDay() == 0 || date.getDay() == 6) {
              return 'day-item weekend weekend-border-bottom'
            } else {
              return 'day-item'
            }
          }
        }
      ]
    },
    {
      name: 'month',
      scale_height: 60,
      min_column_width: 25,
      scales: [
        { unit: 'month', format: '%Y-%m' },
        {
          unit: 'day',
          step: 1,
          format: '%d',
          css: function (date) {
            if (date.getDay() == 0 || date.getDay() == 6) {
              return 'day-item weekend weekend-border-bottom'
            } else {
              return 'day-item'
            }
          }
        }
      ]
    },
    {
      name: 'quarter',//季度
      height: 60,
      min_column_width: 110,
      scales: [
        {
          unit: 'quarter',
          step: 1,
          format: function (date) {
            let yearStr = new Date(date).getFullYear() + '年'
            let dateToStr = gantt.date.date_to_str('%M')
            let endDate = gantt.date.add(gantt.date.add(date, 3, 'month'), -1, 'day')
            return yearStr + dateToStr(date) + ' - ' + dateToStr(endDate)
          }
        },
        {
          unit: 'week',
          step: 1,
          format: function (date) {
            let dateToStr = gantt.date.date_to_str('%m-%d')
            let endDate = gantt.date.add(date, 6, 'day')
            let weekNum = gantt.date.date_to_str('%W')(date)
            return dateToStr(date) + ' 至 ' + dateToStr(endDate)
          }
        }
      ]
    },
    {
      name: 'year',
      scale_height: 50,
      min_column_width: 80,
      scales: [
        { unit: 'year', step: 1, format: '%Y年' },
        { unit: 'month', format: '%Y-%m' }
      ]
    }
  ]
}

//初始化甘特图
const initGantt = () => {
  dhtmlxgantt.config.grid_width = 350
  dhtmlxgantt.config.add_column = false //添加符号

  //时间轴图表中，如果不设置，只有行边框，区分上下的任务，设置之后带有列的边框，整个时间轴变成格子状。
  dhtmlxgantt.config.autofit = false
  dhtmlxgantt.config.autoscroll = false
  dhtmlxgantt.config.row_height = 60
  dhtmlxgantt.config.bar_height = 34
  dhtmlxgantt.config.autosize = 'y'
  // dhtmlxgantt.config.fit_tasks = true //自动延长时间刻度，以适应所有显示的任务
  dhtmlxgantt.config.auto_types = true //将包含子任务的任务转换为项目，将没有子任务的项目转换回任务
  dhtmlxgantt.config.date_format = "%Y-%m-%d %H:%i"; //甘特图时间格式
  dhtmlxgantt.config.readonly = false //是否只读
  dhtmlxgantt.i18n.setLocale('cn') //设置语言
  dhtmlxgantt.config.start_on_monday = true;//是否从周一显示起始时间---右侧条形图
  // if (props.scales?.length) {
  //   dhtmlxgantt.config.scales = props.scales //设置时间刻度
  // }
  gantt.ext.zoom.init(zoomConfig) //配置初始化扩展
  gantt.ext.zoom.setLevel('month') //切换到指定的缩放级别

  //   var monthScaleTemplate = function (date) {
  //     var dateToStr = gantt.date.date_to_str("%M");
  //     var endDate = gantt.date.add(date, 2, "month");
  //     return dateToStr(date) + " - " + dateToStr(endDate);
  // };

  // dhtmlxgantt.config.scales = [
  //     {unit: "year", step: 1, format: "%Y"},
  //     {unit: "month", step: 3, format: monthScaleTemplate},
  //     {unit: "month", step: 1, format: "%M"}
  // ];

  dhtmlxgantt.config.grid_resize = true;
  dhtmlxgantt.config.drag_move = false;
  dhtmlxgantt.config.resize_rows = true;
  // dhtmlxgantt.config.scale_height = 54;
  dhtmlxgantt.config.layout = {
    css: "gantt_container",
    rows: [
      {
        cols: [
          {
            width: 450,
            rows: [
              {
                // the default grid view  
                view: "grid",
                scrollX: "scrollHor",
                scrollY: "scrollVer",
              }
            ]
          },
          { resizer: true, width: 1 },
          {

            rows: [
              {
                view: "timeline",
                scrollX: "scrollHor",
                scrollY: "scrollVer"
              },
              {
                view: "scrollbar",
                id: "scrollHor"
              }
            ]
          },
          {
            view: "scrollbar",
            id: "scrollVer"
          },
        ],
      },
    ]
  }
  dhtmlxgantt.plugins({
    tooltip: true,//鼠标划过任务是否显示明细
    // auto_scheduling: true,//根据任务之间的关系自动安排任务
    // multiselect: true, //为任务激活多任务选择
  });
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

  dhtmlxgantt.attachEvent("onAfterTaskUpdate", (id, item) => {
    console.log('onAfterTaskUpdate', id, { ...item });
  })
  dhtmlxgantt.attachEvent("onLinkDblClick", function (id, e) {
    return false; //阻止默认双击事件
  });
  dhtmlxgantt.attachEvent("onTaskDblClick", function (id, e) {
    emit('onTaskDblClick', id)
    return false;
  });
}

// 切换 年  月 周 日视图 
const ganttChangeDateView = (type) => {
  if (!type) {
    type = 'day'
  }
  gantt.ext.zoom.setLevel(type)
  return
  dhtmlxgantt.config.scale_unit = type;
  switch (type) {
    case 'year':
      dhtmlxgantt.config.step = 1;
      dhtmlxgantt.config.subscales = null;
      dhtmlxgantt.config.date_scale = "%Y年";
      dhtmlxgantt.templates.date_scale = null;
      break;

    case 'month':
      dhtmlxgantt.config.step = 1;
      dhtmlxgantt.config.date_scale = "%m月";
      dhtmlxgantt.templates.date_scale = null;
      break;
    case 'week':
      dhtmlxgantt.config.step = 1;
      dhtmlxgantt.config.date_scale = "第%w周";
      dhtmlxgantt.templates.date_scale = null;

      break;
    case 'day':
      dhtmlxgantt.config.step = 1;
      dhtmlxgantt.config.date_scale = "%m-%d";
      dhtmlxgantt.templates.date_scale = null;
      dhtmlxgantt.config.subscales = null;
      dhtmlxgantt.config.scale_height = 54;
      dhtmlxgantt.config.scales = [
        { unit: "day", step: 1, format: "%m-%d" },
        { unit: "month", step: 1, format: "%F, %Y" },
        {
          unit: "week", step: 1, format: function (date) {
            return "Week #" + gantt.date.getWeek(date);
          }
        },
        {
          unit: "day", step: 1, format: "%D", css: function (date) {
            if (!gantt.isWorkTime({ date: date, unit: "day" })) {
              return "weekend"
            }
          }
        }
      ]
      break;
    case 'hour':
      dhtmlxgantt.config.step = 1;
      dhtmlxgantt.config.scales = [
        { unit: "day", step: 1, format: "%y-%m-%d" },
        { unit: "hour", step: 1, format: "%h:%i" },
      ]
      dhtmlxgantt.config.date_scale = "%h";
      // dhtmlxgantt.templates.date_scale = null;
      // dhtmlxgantt.config.subscales = null;
      // dhtmlxgantt.config.duration_unit  = 'hour';
      break;
  }
  dhtmlxgantt.render();
}

const reload = () => {
  dhtmlxgantt.clearAll();// 从甘特图中删除所有任务和其他元素（包括标记）
  dhtmlxgantt.parse({
    data: ganttData.value,
    links: props.links,
  }); // 数据解析
  dhtmlxgantt.render(); // 呈现整个甘特图
}

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
  reload()
}, {
  deep: true,
  immediate: true
})
onMounted(() => {
  initGantt();
})


defineExpose({
  ganttChangeDateView
});
</script>

<style lang="scss" scoped>
.gantt-main {
  width: 100%;
  height: 100%;
  overflow: auto;

  .weekend {
    color: #d43900;
  }
}
</style>
