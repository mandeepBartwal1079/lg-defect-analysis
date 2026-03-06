export interface ApiResponse {
  data: Plan[]
  success: boolean
  message: string
}

export interface Plan {
  planId: number
  modelNumber: string
  productionLine: string
  partNumber: string
  productionStartDate: string
  productionEndDate: string
  demandDueDate: string
  totalQuantity: number
  completedQty: number
  remainingQty: number
  dailyProductionQuantity: number
  completionPercentage: number
  isOverdue: boolean
  daysRemaining: number
  modelId?: number
  modelName?: string
  parts: Part[]
}

export interface Part {
  partId?: number
  partName?: string
  defects: Defect[]
}

export interface Defect {
  recordId: number
  actualDefect: string
  defectLv1: string
  defectLv2: string
  defectLv3: string
  defectQty: number
  productionLine: string
  detectedProcess: string
  defectDate: string
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  items?: string[];
  isHtml?: boolean;
  fileUrl?: string;
  botData?: ChatBotData;
}

export interface ChatBotDefect {
  defectName: string;
  totalQty: number;
  occurrences: number;
  defectLv1: string;
  defectLv2: string;
  defectLv3: string;
  productionLine: string;
  detectedProcess: string;
  defectDate: string;
}

export interface ChatBotPart {
  partId: number;
  partName: string;
}

export interface ChatBotModel {
  modelName: string;
  defectOccurrenceCount: number;
}

export interface ChatBotData {
  modelId?: number;
  modelName?: string;
  parts?: ChatBotPart[];
  top3Defects?: ChatBotDefect[];
  defectSearchTerm?: string;
  top5Models?: ChatBotModel[];
}

export interface ChatBotApiResponse {
  success: boolean;
  message: string;
  intent: string;
  data: ChatBotData;
}

export interface DefectModalDataI {
  data: Data
  success: boolean
  message: string
}

export interface Data {
  model: string
  defectType: string
  products: string[]
  occurrenceCount: number
  occurrencesDisplay: string
  resolutionDate: string
  resolutionSteps: string[]
}

export interface LgApiResponse {
  status: string
  method: string
  line: string
  pcsgid: string
  query_dates: string[]
  data: LgApiData[]
}

export interface LgApiData {
  ORG_ID: string
  PRDTN_YMD: string
  MFG_ORDER: string
  PCSGID: string
  WOID: string
  DEMAND_ID: string
  DEMAND_TP_CODE: string
  PRDTN_STRT_DATE: string
  PRDTN_END_DATE: string
  PRDTN_STRT_TIME: string
  PRDTN_END_TIME: string
  PRDTN_STRT_SEQ_NO: any
  PRDTN_END_SEQ_NO: any
  DEMAND_DUE_DATE: string
  TOT_QTY: string
  RMN_QTY: string
  COMPLT_QTY: string
  DILY_PRDTN_QTY: string
  WO_STAT_TP_CODE: string
  PLN_FIX_FLAG: string
  YW: string
  YM: string
  MODLID: string
  SFFX_NAME: string
  PRODID: string
  SET_PROD_ID: any
  SET_PROD_NAME?: string
  SET_MDL_ID: any
  SET_LOT_ID: any
  TOOL_NAME: string
  ITM_TYPE: string
  PRODUCT_CODE: any
  PRODTYPE: string
  NEW_MDL_FLAG: string
  TACT_TIME_STD_TIME: string
  STD_TIME: string
  BOM_EXIST_FLAG: string
  MIX_INFO: string
  MIX_SEQ: any
  MIX_GR_TYPE: string
  MIX_GR_ID: string
  BILL_TO_CUSTOMER_ID: string
  BILL_TO_CUSTOMER_CODE: string
  BILL_TO_CUSTOMER_NAME: string
  SHIP_TO_CUSTOMER_ID: string
  SHIP_TO_CUSTOMER_CODE: string
  SHIP_TO_CUSTOMER_NAME: string
  MKT_TP_CODE: string
  ERP_PRDTN_SEQ_NO: string
  MES_PRDTN_SEQ_NO: string
  LAST_OP_FLAG: string
  PLN_NOTES?: string
  MDL_BARCODE: string
  BAS_ITM_ID: any
  DEPT_CODE_NAME: string
  SCHD_FLAG: string
  NEW_MDL_TP_CODE: any
  ATTR01: any
  ATTR02: any
  ATTR03: any
  ATTR04: any
  ATTR05: any
  ATTR06: any
  ATTR07: any
  ATTR08: any
  ATTR09: any
  ATTR10: any
  ATTR11: any
  ATTR12: any
  ATTR13: any
  ATTR14: any
  ATTR15: any
  INSUSER: string
  INSDTTM: string
  UPDUSER: string
  UPDDTTM: string
  PM_DUP_FLAG: any
  MDL_AGAIN_PRDTN_FLAG: any
}
