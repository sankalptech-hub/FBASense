import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};

export const exportToCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateInventoryData = (data) => {
  const errors = [];
  const requiredFields = ['sku', 'product_name', 'quantity', 'cost', 'price'];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`Row ${index + 1}: Missing ${field}`);
      }
    });
    
    if (row.quantity && isNaN(Number(row.quantity))) {
      errors.push(`Row ${index + 1}: Quantity must be a number`);
    }
    
    if (row.cost && isNaN(Number(row.cost))) {
      errors.push(`Row ${index + 1}: Cost must be a number`);
    }
    
    if (row.price && isNaN(Number(row.price))) {
      errors.push(`Row ${index + 1}: Price must be a number`);
    }
  });
  
  return errors;
};

export const validateSalesData = (data) => {
  const errors = [];
  const requiredFields = ['sku', 'product_name', 'date', 'quantity_sold', 'revenue'];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`Row ${index + 1}: Missing ${field}`);
      }
    });
  });
  
  return errors;
};
