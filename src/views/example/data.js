import { buildUUID } from "@/utils/uuid";

export const qr_project_type = [
  { label: "Quantity(数量)", value: "1" },
  { label: "Product Check against Order(产品比对订单要求)", value: "2" },
  { label: "Compliance and Safety Check(合规与安全检查)", value: "3" },
  { label: "Function(功能)", value: "4" },
  { label: "Assembly(装配)", value: "5" },
  { label: "Workmanship and Appearance(工艺和外观) ", value: "6" },
  { label: "Accessorie(配件)", value: "7" },
  { label: "Packing(包装)", value: "8" },
  { label: "Markings &Printing Check(标识、印刷检查)", value: "9" },
  { label: "Testing & Measurement Data(测试与测量数据)", value: "10" },
  { label: "Other Check Points(其它检验点确认检查)", value: "11" },
];

export const qr_standard = {
  1: [
    {
      label: "实际验货的产品数量要符合订单的产品数量",
      en: "The actual quantity of the inspected products should be in accordance with the quantity of the order.",
      value: "1",
    },
  ],
  2: [
    { label: "款式确认", en: "Style Check", value: "1" },
    {
      label: "材质和关键部件检查",
      en: "Material and Critical Component Check",
      value: "2",
    },
    { label: "颜色检查", en: "Color Check", value: "3" },
    {
      label: "标识/吊牌/标签检查，以上符合订单/PI/客户签样要求",
      en: "Logo/Hangtag/Label Check",
      value: "4",
    },
  ],
  3: [
    {
      label:
        "产品的安全性、符合销售国安规要求有无禁运品：粉末、电池、有害物质等",
      en:
        "The safety of the product and compliance with local safety regulations. " +
        "Prohibited items: powder, battery, hazardous substances, etc.",
      value: "1",
    },
  ],
  4: [
    {
      label: "可以正常使用产品的功能，参照产品检验标准",
      en: "The product functions can be used normally. Refer to the product inspection standards.",
      value: "1",
    },
  ],
  5: [
    {
      label: "按照说明书或是组装指引操作可以装配",
      en: "Following the instructions or assembly guidelines can enable the assembly.",
      value: "1",
    },
  ],
  6: [
    {
      label: "外观检查参照产品检验标准",
      en: "Appearance inspection refer to the product inspection standards.",
      value: "1",
    },
    {
      label: "工艺符合订单要求",
      en: "The workmanship refer to the requirements of the order.",
      value: "2",
    },
  ],
  7: [
    {
      label: "配件数量和尺寸符合订单要求",
      en: "The quantity and size of the accessories refer to the requirements of the order.",
      value: "1",
    },
    {
      label: "配件可用于组装",
      en: "The accessories can be used for assembly.",
      value: "2",
    },
  ],
  8: [
    {
      label: "产品包装检查",
      en: "Product packing Check",
      value: "1",
    },
    {
      label: "托盘检查",
      en: "Pallet Check",
      value: "2",
    },
  ],
  9: [
    {
      label: "箱唛、外箱贴纸符合订单要求",
      en: "Shipping Mark Check.",
      value: "1",
    },
  ],
  10: [
    {
      label: "测试项目符合测试结果要求，具体对应产品参照检验标准",
      en: "Data sheet attached for reference.",
      value: "1",
    },
  ],
};

export const qr_project_tree_data = [
  {
    id: buildUUID(),
    qr_project_type: "Quantity(数量)",
    qr_standard: "实际验货的产品数量要符合订单的产品数量",
    qr_standard_en:
      "The actual quantity of the inspected products should be in accordance with the quantity of the order.",
    desc: "备注",
  },
  {
    id: buildUUID(),
    qr_project_type: "Product Check against Order(产品比对订单要求)",
    qr_standard: "款式确认",
    qr_standard_en: "Style Check",
    desc: "备注",
    children: [
      {
        id: buildUUID(),
        qr_project_type: "Product Check against Order(产品比对订单要求)",
        qr_standard: "材质和关键部件检查",
        qr_standard_en: "Material and Critical Component Check",
        desc: "备注",
      },
      {
        id: buildUUID(),
        qr_project_type: "Product Check against Order(产品比对订单要求)",
        qr_standard: "颜色检查",
        qr_standard_en: "Color Check",
        desc: "备注",
      },
      {
        id: buildUUID(),
        qr_project_type: "Product Check against Order(产品比对订单要求)",
        qr_standard: "标识/吊牌/标签检查，以上符合订单/PI/客户签样要求",
        qr_standard_en: "Logo/Hangtag/Label Check",
        desc: "备注",
      },
    ],
  },
  {
    id: buildUUID(),
    qr_project_type: "Compliance and Safety Check(合规与安全检查)",
    qr_standard:
      "产品的安全性、符合销售国安规要求有无禁运品：粉末、电池、有害物质等",
    qr_standard_en:
      "The safety of the product and compliance with local safety regulations. " +
      "Prohibited items: powder, battery, hazardous substances, etc.",
    desc: "备注",
    children: [
      {
        id: buildUUID(),
        qr_project_type: "Compliance and Safety Check(合规与安全检查)",
        qr_standard:
          "产品的安全性、符合销售国安规要求有无禁运品：粉末、电池、有害物质等",
        qr_standard_en:
          "The safety of the product and compliance with local safety regulations. " +
          "Prohibited items: powder, battery, hazardous substances, etc.",
        desc: "备注",
      },
    ],
  },
];
