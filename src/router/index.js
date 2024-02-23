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
      path: "/main/:cfgNo",
      name: "GanttMain3",
      component: GanttMain,
    },
    {
      path: "/ergraph",
      component: () => import("../views/er-graph/index.vue"),
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ],
});

export default router;
