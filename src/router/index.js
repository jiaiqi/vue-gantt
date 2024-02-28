import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import GanttMain from "../views/gantt/index.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "GanttMain",
      component: GanttMain,
    },
    {
      path: "/:cfgNo",
      name: "GanttMain1",
      component: GanttMain,
    },
    {
      path: "/:cfgNo/:pIds",
      name: "GanttMain2",
      component: GanttMain,
    },
    {
      path: "/gantt/:cfgNo",
      name: "GanttMain3",
      component: GanttMain,
    },
    {
      path: "/gantt/:cfgNo/:pIds",
      name: "GanttMain4",
      component: GanttMain,
    },
    {
      path: "/er",
      component: () => import("../views/er-graph/index.vue"),
      children:[
        {
          "path": ":cfgNo",
          "component": () => import("../views/er-graph/index.vue")
        }
      ]
    },
    {
      path: "/ergraph",
      component: () => import("../views/er-graph/index.vue"),
    },
  ],
});

export default router;
