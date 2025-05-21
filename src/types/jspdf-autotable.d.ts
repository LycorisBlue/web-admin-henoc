/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/jspdf-autotable.d.ts
import { jsPDF } from "jspdf";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => any;
  lastAutoTable: {
    finalY: number;
  };
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}
