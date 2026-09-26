import React, { useState } from 'react';
import {
  Code2,
  Database,
  Terminal,
  BookOpen,
  Copy,
  Check,
  Server,
  KeyRound,
  FileCode,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const ApiDocsView: React.FC = () => {
  const { showToast } = useInventory();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    showToast('Copied to Clipboard', 'Code block copied successfully.', 'success');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const mongooseModelsCode = `// models/InventoryModels.ts
import mongoose, { Schema, Document } from 'mongoose';

// 1. PRODUCT SCHEMA
export interface IProduct extends Document {
  sku: string;
  barcode: string;
  name: string;
  category: string;
  uom: string;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  warehouseStocks: Array<{
    warehouseId: mongoose.Types.ObjectId;
    warehouseCode: string;
    quantity: number;
    reserved: number;
    locationBin: string;
  }>;
  lotTracking: boolean;
  activeLotNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true, uppercase: true, index: true },
  barcode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  uom: { type: String, required: true, default: 'pcs' },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  reorderPoint: { type: Number, required: true, default: 10 },
  safetyStock: { type: Number, required: true, default: 5 },
  warehouseStocks: [{
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    warehouseCode: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    locationBin: { type: String, default: 'General' },
  }],
  lotTracking: { type: Boolean, default: false },
  activeLotNumber: { type: String },
}, { timestamps: true });

// 2. WAREHOUSE SCHEMA
export interface IWarehouse extends Document {
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  managerName: string;
  totalCapacitySqFt: number;
  utilizedCapacitySqFt: number;
  zones: string[];
  status: 'active' | 'maintenance' | 'inactive';
}

export const WarehouseSchema = new Schema<IWarehouse>({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  managerName: { type: String },
  totalCapacitySqFt: { type: Number, required: true },
  utilizedCapacitySqFt: { type: Number, default: 0 },
  zones: [{ type: String }],
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
});

// 3. INVENTORY MOVEMENT SCHEMA (Receipts, Deliveries, Transfers, Adjustments)
export const MovementSchema = new Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['receipt', 'delivery', 'transfer', 'adjustment'], required: true },
  status: { type: String, enum: ['draft', 'pending_approval', 'in_transit', 'completed', 'cancelled'], default: 'completed' },
  date: { type: Date, default: Date.now },
  sourceWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
  destinationWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
  partnerName: { type: String },
  partnerReference: { type: String },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productSku: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    uom: { type: String },
    lotNumber: { type: String },
  }],
  totalValue: { type: Number, required: true },
  notes: { type: String },
  createdBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
  },
  approvedBy: {
    userId: { type: String },
    userName: { type: String },
    timestamp: { type: Date },
    remarks: { type: String },
  },
}, { timestamps: true });

// 4. PERPETUAL STOCK LEDGER SCHEMA (Double-Entry Audit)
export const StockLedgerSchema = new Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  movementRef: { type: String, required: true },
  movementType: { type: String, enum: ['receipt', 'delivery', 'transfer', 'adjustment'], required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  warehouseCode: { type: String, required: true },
  quantityChange: { type: Number, required: true },
  runningBalance: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalValuationChange: { type: Number, required: true },
  locationBin: { type: String },
  performedBy: { type: String, required: true },
  remarks: { type: String },
});`;

  const expressRestApiCode = `// server.ts - StockSense Express REST API
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// JWT Authentication Middleware with RBAC verification
const authenticate = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer JWT token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'StockSenseSecretKey') as any;
      req.user = decoded;
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient RBAC permissions for this operation' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired JWT' });
    }
  };
};

// 1. PRODUCTS API
app.get('/api/products', authenticate(), async (req, res) => {
  /* Return all products with warehouse breakdowns */
});

app.post('/api/products', authenticate(['admin', 'warehouse_manager']), async (req, res) => {
  /* Create product and write initial stock entry to ledger */
});

// 2. GOODS RECEIPTS API
app.post('/api/receipts', authenticate(['admin', 'warehouse_manager', 'inventory_clerk']), async (req, res) => {
  const { totalValue, items, destinationWarehouseId } = req.body;
  const requiresApproval = totalValue > 10000 && req.user.role === 'inventory_clerk';
  const status = requiresApproval ? 'pending_approval' : 'completed';

  // If approved/clerk within threshold: increment stock and post to stock ledger
});

// 3. CUSTOMER DELIVERIES API
app.post('/api/deliveries', authenticate(['admin', 'warehouse_manager', 'inventory_clerk']), async (req, res) => {
  // Validate stock sufficiency -> deduct stock -> write negative entry to ledger
});

// 4. APPROVAL WORKFLOW API
app.post('/api/approvals/:movementId/approve', authenticate(['admin', 'warehouse_manager']), async (req, res) => {
  // Execute movement approval and commit pending ledger rows
});

// 5. DOUBLE-ENTRY LEDGER API
app.get('/api/ledger', authenticate(), async (req, res) => {
  /* Query immutable ledger records with pagination and filters */
});`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          REST API & MongoDB Database Architecture
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enterprise backend specifications, Mongoose data models, JWT authentication headers & deployment runbook
        </p>
      </div>

      {/* REST API Endpoints Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            REST API Routing Specification
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                GET
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/products</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">List all catalog SKUs with multi-hub stock balances</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                POST
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/receipts</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">Process Goods Received Note (GRN) & increment facility inventory</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                POST
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/deliveries</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">Validate stock & dispatch customer delivery orders</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                POST
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/transfers</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">Dispatch inter-depot rebalancing transfers with in-transit tracking</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                POST
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/approvals/:id/approve</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">Manager/Admin authorization of high-value consignments or adjustments</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                GET
              </span>
              <span className="text-slate-900 dark:text-slate-100">/api/ledger</span>
            </div>
            <span className="text-slate-500 text-[11px] font-sans">Query immutable double-entry stock movement ledger records</span>
          </div>
        </div>
      </div>

      {/* MongoDB Mongoose Schemas Code Block */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              MongoDB Mongoose Schemas & TypeScript Models
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(mongooseModelsCode, 'models')}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedSection === 'models' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'models' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
          {mongooseModelsCode}
        </pre>
      </div>

      {/* Express Controller Snippet */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Express.js Server & Controller Implementation
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(expressRestApiCode, 'server')}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedSection === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'server' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
          {expressRestApiCode}
        </pre>
      </div>

      {/* Setup and Deployment Guide */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 text-xs">
        <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>Setup & Production Deployment Runbook</span>
        </h2>
        <div className="space-y-2 text-slate-600 dark:text-slate-400">
          <p>
            <strong>1. Prerequisites:</strong> Node.js 20+, MongoDB Atlas cluster or local MongoDB instance, npm or pnpm.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px]">
            # Clone repository and install dependencies<br />
            git clone https://github.com/enterprise/stocksense-ims.git<br />
            cd stocksense-ims && npm install<br /><br />
            # Configure environment variables (.env)<br />
            MONGODB_URI="mongodb+srv://admin:pass@cluster.mongodb.net/stocksense?retryWrites=true"<br />
            JWT_SECRET="YourSuperSecretJWTSigningKey"<br />
            PORT=3000<br /><br />
            # Start development server<br />
            npm run dev<br /><br />
            # Compile and build for production<br />
            npm run build && npm run preview
          </div>
        </div>
      </div>
    </div>
  );
};
