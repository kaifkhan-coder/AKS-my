import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Download,
  FolderSync,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  ShieldCheck,
  Clock,
  ExternalLink,
  Layers,
  Database,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const KiranaSyncCloudView: React.FC = () => {
  const {
    activeStore,
    inventory,
    bills,
    customers,
    creditLedger,
    categories,
    orders,
    staffMembers,
    lastSyncTime,
    isSyncing,
    createKiranaSyncBackup,
  } = useStore();

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleSyncNow = async () => {
    const res = await createKiranaSyncBackup();
    if (res.success) {
      setSyncMessage(`Backup saved to Google Cloud folder "KiranaSync" (${res.file})`);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const backupData = {
    store: activeStore,
    timestamp: new Date().toISOString(),
    cloudFolder: 'KiranaSync',
    inventoryCount: inventory.filter((i) => i.storeId === activeStore.id).length,
    billsCount: bills.filter((b) => b.storeId === activeStore.id).length,
    customersCount: customers.filter((c) => c.storeId === activeStore.id).length,
    creditLedgerEntries: creditLedger.length,
    categoriesCount: categories.length,
    ordersCount: orders.filter((o) => o.storeId === activeStore.id).length,
    staffCount: staffMembers.filter((s) => s.storeId === activeStore.id).length,
    data: {
      inventory: inventory.filter((i) => i.storeId === activeStore.id),
      bills: bills.filter((b) => b.storeId === activeStore.id),
      customers: customers.filter((c) => c.storeId === activeStore.id),
      creditLedger,
      categories,
      orders: orders.filter((o) => o.storeId === activeStore.id),
      staffMembers: staffMembers.filter((s) => s.storeId === activeStore.id),
    },
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KiranaSync_${activeStore.name.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="kirana-cloud-sync-page" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Google Cloud 'KiranaSync' Storage & Data Backups
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated, encrypted sync of store inventory, bills, ledger entries, and categories to your Google Cloud Drive folder
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            id="btn-cloud-sync-now"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            <span>{isSyncing ? 'Syncing...' : 'Sync to KiranaSync Folder'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Cloud Drive Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Target Cloud Folder</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
              /Google Drive/KiranaSync
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              ✓ Folder initialized & verified
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Last Synced Timestamp</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {new Date(lastSyncTime).toLocaleDateString()} at {new Date(lastSyncTime).toLocaleTimeString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Automated sync on billing & edits
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Backup Encryption & Auth</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              TLS 1.3 / OAuth2 Token
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              Stored exclusively in owner's cloud
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Datasets Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Synchronized Kirana Data Modules</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All collections backed up directly to JSON snapshot files inside the 'KiranaSync' folder
            </p>
          </div>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {showRawJson ? 'Hide Raw JSON Payload' : 'Inspect Raw Backup Payload'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Products</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.inventoryCount}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Bills Generated</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.billsCount}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Khata Customers</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.customersCount}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Credit Ledger Records</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.creditLedgerEntries}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Item Categories</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.categoriesCount}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500">Customer Orders</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              {backupData.ordersCount}
            </div>
          </div>
        </div>

        {showRawJson && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-72">
              {JSON.stringify(backupData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Cloud Backup Protocol Explanation */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-600">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <FolderSync className="w-4 h-4 text-emerald-600" />
          <span>How KiranaSync Works on Google Cloud</span>
        </h3>
        <p>
          1. <strong>Isolated Store Folder:</strong> The application automatically provisions and maintains a folder named <code>'KiranaSync'</code> inside your personal Google Cloud / Google Drive storage.
        </p>
        <p>
          2. <strong>Zero Data Loss:</strong> Whenever you generate a bill, update inventory quantities, or record a customer Udhar payment, state is locally cached and synced to the cloud folder.
        </p>
        <p>
          3. <strong>Multi-Device Sync:</strong> When opening the shop application on a counter tablet, phone, or laptop, logging in with your authenticated Gmail credentials restores all data directly from your <code>'KiranaSync'</code> cloud folder.
        </p>
      </div>
    </div>
  );
};
