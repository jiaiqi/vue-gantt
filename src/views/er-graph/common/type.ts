/** er图配置 */
export interface ErConfig {
  /** 微服务 */
  er_mapp?: string;
  /** 项目名称 */
  er_name?: string;
  /** 项目编号 */
  er_no?: string;
  /** fk新增服务 */
  fk_add_srv?: string;
  /** fk引用元素a */
  fk_col_item_a?: string;
  /** fk引用元素b */
  fk_col_item_b?: string;
  /** fk引用对象a */
  fk_col_obj_a?: string;
  /** fk引用对象b */
  fk_col_obj_b?: string;
  /** fk查询服务 */
  fk_select_srv?: string;
  /** fk更新服务 */
  fk_update_srv?: string;
  /**分组布局json字段 */
  group_col_layout_json?: string;
  /**分组布局编号字段 */
  group_col_layout_no?: string;
  /**组成员唯一标识字段 */
  group_col_member_fk_id?: string;
  /**组成员变量json */
  group_col_member_json?: string;
  /**分组名称字段 */
  group_col_name?: string;
  /**分组编号字段 */
  group_col_no?: string;
  /**分组父编号字段 */
  group_col_parent_no?: string;
  /**分组查询服务 */
  group_select_srv?: string;
  /**分组更新服务 */
  group_update_srv?: string;
  /**子项目归属对象编号字段 */
  items_col_fk_obj_no?: string;
  /**子项目编号字段 */
  items_col_no?: string;
  /**子项目标题字段 */
  items_col_title?: string;
  /**子项目类型字段 */
  items_col_type?: string;
  /**子项目查询服务 */
  items_select_srv?: string;
  /**子项目编辑服务 */
  items_update_srv?: string;
  /** 子项目新增服务 */
  items_add_srv?: string;
  
  obj_col_fk_group_no?: string;
  obj_col_layout_json?: string;
  obj_col_layout_no?: string;
  obj_col_member_fk_id?: string;
  obj_col_member_fk_title?: string;
  obj_col_no?: string;
  obj_col_title?: string;
  /** 对象新增服务 */
  obj_add_srv?: string;
  /** 对象查询服务 */
  obj_select_srv?: string;
  /** 对象更新服务 */
  obj_update_srv?: string;
}
