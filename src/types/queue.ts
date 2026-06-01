import { REPORT_STATES } from "../constants/reportStates.js";

export type ReportResultStatus =
  | typeof REPORT_STATES.RECHAZADO
  | typeof REPORT_STATES.VALIDADO
  | typeof REPORT_STATES.DUPLICADO;

export interface ReportValidateMessage {
  reportId: number;
  action: "validate_report";
  timestamp: string;
}

export interface ReportResultMessage {
  reportId: number;
  status: ReportResultStatus;
  timestamp: string;
}
