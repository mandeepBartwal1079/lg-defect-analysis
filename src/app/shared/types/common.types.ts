export interface ApiResponse {
  data: Plan[]
  success: boolean
  message: string
}

export interface Plan {
  planId: number
  modelNumber: string
  tool?: string
  productionLine?: string
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
  top5Defects: Top5Defect[]
  parts: Part[]
}

export interface Top5Defect {
  defectName: string
  count: number
  percentage: number
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
  defects?: string[];
  models?: defectModel[];
  defectName?: string;
}
export interface defectModel {
  modelName: string;
  defectOccurrenceCount: number;
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
export interface ModelNamesResponse {
  data: ModelName[]
  success: boolean
  message: string
}

export interface ModelName {
  id: string
  name: string
}

// Model Filter Response
export interface ModelFilterItem {
  modelId: number
  modelName: string
  tool: string
  productionLine: string
  top5Defects: Top5Defect[]
}

export interface ModelFilterResponse {
  data: ModelFilterItem[]
  success: boolean
  message: string
}

// Tools Response
export interface ToolsApiResponse {
  data: Tool[]
  success: boolean
  message: string
}

export interface Tool {
  tool: string
  models: string[]
  totalModels: number
  productionLines: string[]
  totalDefects: number
  top5Defects: Top5Defect[]
}

// Resolution Steps Response
export interface ResolutionStepsResponse {
  data: ResolutionStep[]
  success: boolean
  message: string
}

export interface ResolutionStep {
  resolutionId: number
  defectName: string
  defectCategory: string
  defectPart: string
  defectType: string
  totalCauses: number
  causes: Cause[]
}

export interface Cause {
  causeId: number
  causeNumber: number
  causeDescription: string
}
