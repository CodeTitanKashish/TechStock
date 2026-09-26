/**
 * Formatting Utilities for StockSense ERP
 * Formats all financial numbers in Indian Rupees (₹)
 */

export const formatRupees = (amount: number | string | undefined | null, decimals: number = 2): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const numericVal = Number(amount);
  return `₹${numericVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatCurrency = formatRupees;

export const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('en-IN');
};

export const formatCompactRupees = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};
