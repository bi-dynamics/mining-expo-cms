import { Timestamp } from "firebase/firestore";

export interface ExhibitorType {
  id: string;
  logo: string;
  name: string;
  description: string;
  status: "active" | "draft";
  yearsAtEvent: number[];
}

export interface updateFanHighlightsType {
  id: string;
  logo: string;
  name: string;
  description: string;
  yearsAtEvent: number[];
  status?: "active" | "draft";
}
