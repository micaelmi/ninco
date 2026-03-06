import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Transaction } from '../api/types';

export const exportToCSV = (transactions: Transaction[]) => {
  const data = transactions.map((t) => ({
    Date: t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '-',
    Description: t.description || '-',
    Amount: t.amount || '-',
    Type: t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase() : '-',
    Category: t.category?.name || '-',
    Account: t.account?.name || t.accountId || '-',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transactions_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (transactions: Transaction[]) => {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transactions_export_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (transactions: Transaction[]) => {
  const data = transactions.map((t) => ({
    Date: t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '-',
    Description: t.description || '-',
    Amount: t.amount ? Number(t.amount) : null,
    Type: t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase() : '-',
    Category: t.category?.name || '-',
    Account: t.account?.name || t.accountId || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  
  // Optional: Auto-fit column widths
  const objectMaxLength: number[] = [];
  data.forEach((row) => {
    Object.values(row).forEach((value, idx) => {
      const val = value !== null ? value.toString() : "";
      if (typeof val === "string") {
        objectMaxLength[idx] = Math.max(objectMaxLength[idx] || 0, val.length);
      }
    });
  });

  const wscols = objectMaxLength.map((w) => ({ width: w + 2 })); // Adding padding
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `transactions_export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
};

export const exportToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  
  doc.text('Transactions Export', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);

  const tableColumn = ["Date", "Description", "Type", "Category", "Amount"];
  const tableRows: any[] = [];

  transactions.forEach((t) => {
    const transactionData = [
      t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '-',
      t.description || '-',
      t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase() : '-',
      t.category?.name || '-',
      t.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(t.amount)) : '-',
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`transactions_export_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
