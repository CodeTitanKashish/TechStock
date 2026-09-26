import React from 'react';
import { X, Printer, Download, CheckCircle, Boxes } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const PrintSlipModal: React.FC = () => {
  const { activeSlipMovement, closePrintSlip } = useInventory();

  if (!activeSlipMovement) return null;

  const movement = activeSlipMovement;

  const getDocTitle = () => {
    switch (movement.type) {
      case 'receipt':
        return 'GOODS RECEIVED NOTE (GRN)';
      case 'delivery':
        return 'DELIVERY ORDER & PACKING SLIP';
      case 'transfer':
        return 'INTER-DEPOT TRANSFER WAYBILL';
      case 'adjustment':
        return 'STOCK COUNT RECONCILIATION SHEET';
      default:
        return 'STOCK MOVEMENT MANIFEST';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden when printed) */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-700">Document Print Preview</span>
            <span className="font-mono text-xs text-slate-500">[{movement.referenceNumber}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={closePrintSlip}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Canvas */}
        <div className="p-8 overflow-y-auto flex-1 font-sans text-xs bg-white" id="printable-slip">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                <Boxes className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-slate-900">StockSense Global Logistics</h1>
                <p className="text-[11px] text-slate-500">Enterprise Supply Chain & Warehouse Network</p>
                <p className="text-[10px] text-slate-400">ISO 9001:2015 Certified Supply Operations</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-black text-base text-slate-900 tracking-wide uppercase">
                {getDocTitle()}
              </h2>
              <p className="font-mono text-xs font-bold text-indigo-700 mt-0.5">
                DOC #: {movement.referenceNumber}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Date: {new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Origin / Source Location:
              </span>
              <p className="font-semibold text-slate-800 text-xs">
                {movement.sourceWarehouseName || (movement.type === 'receipt' ? movement.partnerName : 'Central Hub')}
              </p>
              {movement.partnerReference && (
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Ref Code / PO / SO: <span className="font-mono font-medium">{movement.partnerReference}</span>
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Destination / Consignee:
              </span>
              <p className="font-semibold text-slate-800 text-xs">
                {movement.destinationWarehouseName || (movement.type === 'delivery' ? movement.partnerName : 'Stock Reconciliation')}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Movement Status: <span className="font-semibold uppercase text-emerald-700">{movement.status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="my-6">
            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 border-r border-slate-200">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">SKU / Code</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Item Description</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Lot / Batch</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Quantity</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Unit Value</th>
                  <th className="py-2.5 px-3 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movement.items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-medium text-slate-900">{item.productSku}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-800">{item.productName}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600">{item.lotNumber || 'STANDARD'}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {Math.abs(item.quantity)} {item.uom}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-slate-700">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${(Math.abs(item.quantity) * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-900 text-xs">
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider text-slate-600">
                    Consolidated Total Valuation:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {movement.items.reduce((s, i) => s + Math.abs(i.quantity), 0)} units
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200"></td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-indigo-900">
                    ${Math.abs(movement.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {movement.notes && (
            <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
              <span className="font-bold block mb-0.5">Remarks / Handling Notes:</span>
              <p>{movement.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 h-10 mb-2 flex items-end justify-center font-serif italic text-slate-600">
                {movement.createdBy.userName}
              </div>
              <p className="font-semibold text-slate-800">Issued / Prepared By</p>
              <p className="text-[10px] text-slate-400 capitalize">{movement.createdBy.userRole.replace('_', ' ')}</p>
            </div>

            <div>
              <div className="border-b border-slate-400 h-10 mb-2 flex items-end justify-center font-serif italic text-slate-600">
                {movement.approvedBy ? movement.approvedBy.userName : '____________________'}
              </div>
              <p className="font-semibold text-slate-800">Warehouse Supervisor</p>
              <p className="text-[10px] text-slate-400">Quality & Count Verifier</p>
            </div>

            <div>
              <div className="border-b border-slate-400 h-10 mb-2 flex items-end justify-center font-serif italic text-slate-600">
                ____________________
              </div>
              <p className="font-semibold text-slate-800">Carrier / Recipient</p>
              <p className="text-[10px] text-slate-400">Goods Receipt Acceptance</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            Generated via StockSense ERP Cloud • Document Verification Hash: {movement.id}
          </div>
        </div>
      </div>
    </div>
  );
};
