import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  FileJson,
  FileArchive,
  RefreshCw,
  Info,
  Copy,
  Check,
  Database,
  Play,
  Terminal,
  Cloud,
  Layers,
  Send
} from 'lucide-react';
import JSZip from 'jszip';
import { AppState, UserAccount, UserRole } from '../types';

interface SettingsViewProps {
  appData: AppState;
  registeredUsers: UserAccount[];
  onImportState: (newAppData: AppState, newUsers?: UserAccount[]) => void;
  userRole: UserRole;
}

export default function SettingsView({
  appData,
  registeredUsers,
  onImportState,
  userRole
}: SettingsViewProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    hasAppData: boolean;
    hasUsers: boolean;
    infoMsg?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<{
    appData?: AppState;
    registeredUsers?: UserAccount[];
    fileName: string;
    fileSize: string;
  } | null>(null);

  // Turso Database States
  const [tursoUrl, setTursoUrl] = useState(() => localStorage.getItem('turso_db_url') || '');
  const [tursoToken, setTursoToken] = useState(() => localStorage.getItem('turso_db_token') || '');
  const [tursoTestResult, setTursoTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tursoInitResult, setTursoInitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tursoSyncResult, setTursoSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tursoLoadResult, setTursoLoadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tursoLoading, setTursoLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM sqlite_master WHERE type="table";');
  const [sqlResult, setSqlResult] = useState<{ success: boolean; columns: string[]; rows: any[]; affectedRows?: number; message?: string } | null>(null);

  const saveTursoCredentials = (url: string, token: string) => {
    localStorage.setItem('turso_db_url', url);
    localStorage.setItem('turso_db_token', token);
  };

  const handleTestConnection = async () => {
    setTursoLoading(true);
    setTursoTestResult(null);
    try {
      const response = await fetch('/api/turso/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tursoUrl, authToken: tursoToken })
      });
      const data = await response.json();
      setTursoTestResult(data);
      if (data.success) saveTursoCredentials(tursoUrl, tursoToken);
    } catch (err: any) {
      setTursoTestResult({ success: false, message: err.message || 'Network error occurred while testing.' });
    } finally {
      setTursoLoading(false);
    }
  };

  const handleInitTables = async () => {
    setTursoLoading(true);
    setTursoInitResult(null);
    try {
      const response = await fetch('/api/turso/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tursoUrl, authToken: tursoToken })
      });
      const data = await response.json();
      setTursoInitResult(data);
      if (data.success) saveTursoCredentials(tursoUrl, tursoToken);
    } catch (err: any) {
      setTursoInitResult({ success: false, message: err.message || 'Network error occurred.' });
    } finally {
      setTursoLoading(false);
    }
  };

  const handleSyncStateToTurso = async () => {
    setTursoLoading(true);
    setTursoSyncResult(null);
    try {
      // 1. Sync AppState
      const resState = await fetch('/api/turso/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tursoUrl, authToken: tursoToken, key: 'master_state', data: appData })
      });
      const dataState = await resState.json();

      // 2. Sync Registered Users
      const resUsers = await fetch('/api/turso/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tursoUrl, authToken: tursoToken, key: 'registered_users', data: registeredUsers })
      });
      const dataUsers = await resUsers.json();

      if (dataState.success && dataUsers.success) {
        setTursoSyncResult({ success: true, message: 'Current application state & registered users successfully synced to Turso Cloud DB!' });
        saveTursoCredentials(tursoUrl, tursoToken);
      } else {
        setTursoSyncResult({ success: false, message: `Failed to sync: App State: ${dataState.success ? 'Success' : 'Fail'}, Users: ${dataUsers.success ? 'Success' : 'Fail'}` });
      }
    } catch (err: any) {
      setTursoSyncResult({ success: false, message: err.message || 'Network error occurred.' });
    } finally {
      setTursoLoading(false);
    }
  };

  const handleLoadStateFromTurso = async () => {
    setTursoLoading(true);
    setTursoLoadResult(null);
    try {
      // 1. Load AppState
      const qParams = new URLSearchParams({ url: tursoUrl, authToken: tursoToken });
      const resState = await fetch(`/api/turso/load-state/master_state?${qParams.toString()}`);
      const dataState = await resState.json();

      // 2. Load Registered Users
      const resUsers = await fetch(`/api/turso/load-state/registered_users?${qParams.toString()}`);
      const dataUsers = await resUsers.json();

      if (dataState.success && dataState.data && dataUsers.success && dataUsers.data) {
        onImportState(dataState.data, dataUsers.data);
        setTursoLoadResult({ success: true, message: 'Successfully loaded state & users from Turso Database!' });
        saveTursoCredentials(tursoUrl, tursoToken);
      } else {
        setTursoLoadResult({
          success: false,
          message: `Could not load state. Ensure you have synchronized or initialized database. (State found: ${dataState.success ? 'Yes' : 'No'}, Users found: ${dataUsers.success ? 'Yes' : 'No'})`
        });
      }
    } catch (err: any) {
      setTursoLoadResult({ success: false, message: err.message || 'Network error occurred.' });
    } finally {
      setTursoLoading(false);
    }
  };

  const handleExecuteSqlQuery = async () => {
    setTursoLoading(true);
    setSqlResult(null);
    try {
      const response = await fetch('/api/turso/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tursoUrl, authToken: tursoToken, sql: sqlQuery })
      });
      const data = await response.json();
      setSqlResult(data);
    } catch (err: any) {
      setSqlResult({ success: false, columns: [], rows: [], message: err.message || 'Query execution failed.' });
    } finally {
      setTursoLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = userRole === 'Admin' || userRole === 'Super Admin';

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupJsonString = () => {
    const backupData = {
      backupVersion: 1.0,
      backupTime: new Date().toISOString(),
      exportedBy: userRole,
      appData,
      registeredUsers
    };
    return JSON.stringify(backupData, null, 2);
  };

  // Helper to trigger file download
  const handleExport = () => {
    try {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = '/api/download-zip';
      downloadAnchor.download = 'it_asset_manager_website.zip';
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setSuccessMsg('Website source code ZIP package downloaded successfully!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(`Download failed: ${err.message || err}`);
      setSuccessMsg('');
    }
  };

  // Copy to clipboard fallback for iframe browser environments
  const handleCopyToClipboard = async () => {
    try {
      const jsonString = getBackupJsonString();
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setSuccessMsg('Full database backup JSON copied to clipboard!');
      setErrorMsg('');
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      try {
        const jsonString = getBackupJsonString();
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setSuccessMsg('Full database backup JSON copied to clipboard!');
        setErrorMsg('');
        setTimeout(() => setCopied(false), 3000);
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (fallbackErr: any) {
        setErrorMsg('Failed to auto-copy to clipboard. Please expand the Raw JSON Backup panel below and manually copy the text.');
        setSuccessMsg('');
      }
    }
  };

  // Validate the schema of the uploaded backup JSON
  const validateBackupSchema = (data: any): {
    valid: boolean;
    hasAppData: boolean;
    hasUsers: boolean;
    appData?: AppState;
    users?: UserAccount[];
    error?: string;
  } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, hasAppData: false, hasUsers: false, error: 'Backup data is not a valid JSON object.' };
    }

    let extractedAppData: any = null;
    let extractedUsers: any = null;

    // Check if it's our wrapped backup format or raw AppState
    if ('appData' in data || 'registeredUsers' in data) {
      extractedAppData = data.appData;
      extractedUsers = data.registeredUsers;
    } else {
      // Treat the root object as the appData itself
      extractedAppData = data;
    }

    let hasAppData = false;
    let hasUsers = false;

    // Validate AppState structure if present
    if (extractedAppData) {
      const requiredKeys: (keyof AppState)[] = [
        'branches', 'suppliers', 'categories', 'brands', 'uoms', 
        'products', 'departments', 'designations', 'employees', 
        'purchases', 'purchaseReturns', 'deliveries', 'sells', 
        'adjustments', 'transfers', 'requisitions', 'cashTransactions'
      ];

      const missingKeys = requiredKeys.filter(key => !(key in extractedAppData) || !Array.isArray(extractedAppData[key]));
      
      if (missingKeys.length > 0) {
        // If they uploaded just a subset or random JSON, fail appData check
        if (data.appData) {
          return {
            valid: false,
            hasAppData: false,
            hasUsers: false,
            error: `Missing required collections in appData: ${missingKeys.join(', ')}`
          };
        }
      } else {
        hasAppData = true;
      }
    }

    // Validate registeredUsers if present
    if (extractedUsers) {
      if (Array.isArray(extractedUsers)) {
        const isValidUser = extractedUsers.every(u => u && typeof u === 'object' && 'email' in u && 'role' in u);
        if (isValidUser) {
          hasUsers = true;
        } else {
          return {
            valid: false,
            hasAppData,
            hasUsers: false,
            error: 'User accounts list contains invalid user objects.'
          };
        }
      } else {
        return {
          valid: false,
          hasAppData,
          hasUsers: false,
          error: 'Registered users backup must be an array.'
        };
      }
    }

    if (!hasAppData && !hasUsers) {
      return {
        valid: false,
        hasAppData: false,
        hasUsers: false,
        error: 'JSON structure does not match a valid IT Asset backup file.'
      };
    }

    return {
      valid: true,
      hasAppData,
      hasUsers,
      appData: extractedAppData,
      users: extractedUsers
    };
  };

  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setErrorMsg('Invalid file format. Please upload a .zip backup file.');
      setValidationResult(null);
      setPendingBackup(null);
      return;
    }

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      // Find the first JSON file in the ZIP archive
      const jsonFile = Object.values(contents.files).find(f => f.name.endsWith('.json') && !f.dir);
      
      if (!jsonFile) {
        setErrorMsg('Invalid ZIP backup. No JSON configuration or database snapshot found inside the ZIP file.');
        setValidationResult(null);
        setPendingBackup(null);
        return;
      }

      const jsonText = await jsonFile.async('string');
      const parsed = JSON.parse(jsonText);
      const validation = validateBackupSchema(parsed);

      if (!validation.valid) {
        setErrorMsg(validation.error || 'Schema validation failed.');
        setValidationResult(null);
        setPendingBackup(null);
      } else {
        setErrorMsg('');
        setValidationResult({
          valid: true,
          hasAppData: validation.hasAppData,
          hasUsers: validation.hasUsers,
          infoMsg: `Validated successfully. Extracted "${jsonFile.name}" from ZIP. Included: ${[
            validation.hasAppData ? 'Asset Data Collections' : '',
            validation.hasUsers ? 'User Accounts & Roles' : ''
          ].filter(Boolean).join(' & ')}.`
        });
        setPendingBackup({
          appData: validation.appData,
          registeredUsers: validation.users,
          fileName: file.name,
          fileSize: formatBytes(file.size)
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to parse ZIP archive: ${err.message || err}`);
      setValidationResult(null);
      setPendingBackup(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    if (!pendingBackup) return;
    if (!isAdmin) {
      setErrorMsg('Access Denied. Only Administrators can overwrite application state backups.');
      return;
    }

    try {
      onImportState(
        pendingBackup.appData || appData,
        pendingBackup.registeredUsers
      );
      setSuccessMsg('Restore complete! The entire application state has been overwritten and synced.');
      setErrorMsg('');
      setPendingBackup(null);
      setValidationResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message || err}`);
    }
  };

  const handleCancelPending = () => {
    setPendingBackup(null);
    setValidationResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Introduction Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
        <div className="flex gap-3 items-center">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-sans">System Backup & Migration</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Export and restore all offline application snapshot data (all assets, branches, roles, and configured settings) using a portable ZIP archive format.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EXPORT PANEL */}
        <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 font-sans uppercase tracking-wider">Export Backup</h4>
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Generate a secure database snapshot. This backup is offline-compatible and can be imported to restore this exact state.
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase block mb-1.5">Included Datasets</span>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600 font-mono">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {appData.products.length} Products
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  {appData.branches.length} Branches
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  {appData.employees.length} Employees
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  {appData.purchases.length} Purchases
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  {appData.cashTransactions.length} Cashbook
                </li>
                <li className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {registeredUsers.length} Users
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all hover:cursor-pointer shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 border border-zinc-200 transition-all hover:cursor-pointer shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="w-full py-0.5 text-zinc-500 hover:text-zinc-800 text-[9px] font-mono uppercase flex items-center justify-center gap-1 transition-all hover:cursor-pointer"
              >
                <FileJson className="w-3 h-3" />
                <span>{showRawJson ? 'Hide Raw JSON' : 'View Raw JSON'}</span>
              </button>

              {showRawJson && (
                <div className="mt-1.5">
                  <textarea
                    readOnly
                    onClick={(e) => {
                      (e.target as HTMLTextAreaElement).select();
                    }}
                    value={getBackupJsonString()}
                    className="w-full h-24 p-2 bg-zinc-900 text-zinc-200 text-[9px] font-mono rounded-lg border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none cursor-text select-all"
                    placeholder="Raw JSON Backup Output..."
                  />
                  <p className="text-[8px] text-zinc-400 font-mono text-center mt-0.5">
                    Click box to auto-select, then press Ctrl+C / ⌘+C to copy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IMPORT PANEL */}
        <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 font-sans uppercase tracking-wider">Import Restore</h4>
            </div>

            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Restore the database state by uploading a valid ZIP backup archive. This overwrites existing records instantly.
            </p>

            {/* Error & Success Feeds */}
            {successMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-[11px] text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                <span className="font-sans">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-[11px] text-rose-800">
                <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                <span className="font-mono">{errorMsg}</span>
              </div>
            )}

            {/* Upload Zone */}
            {!pendingBackup ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[95px] max-w-xs mx-auto w-full ${
                  isDragging 
                    ? 'border-[#00E599] bg-emerald-50/10' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".zip"
                  className="hidden"
                />
                <FileArchive className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[10px] font-semibold text-gray-700 block">Drag & Drop Backup ZIP</span>
                <span className="text-[8px] text-gray-400 mt-0.5 block">or click to browse files</span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-gray-150 rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <FileArchive className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <span className="text-[11px] font-bold text-gray-900 block truncate font-mono">{pendingBackup.fileName}</span>
                    <span className="text-[9px] text-gray-500 block font-mono">{pendingBackup.fileSize}</span>
                  </div>
                </div>

                {validationResult && (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-sans">Ready for Restore</span>
                      <p className="text-[9px] text-emerald-700 mt-0.5 font-mono">{validationResult.infoMsg}</p>
                    </div>
                  </div>
                )}

                {/* Overwrite Warning Box */}
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 flex gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">DANGER ZONE</span>
                    <p className="text-[9px] text-amber-800 mt-0.5 leading-relaxed">
                      This will completely replace all current records. This action is irreversible.
                    </p>
                  </div>
                </div>

                {/* Admin Auth Lock */}
                {!isAdmin && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900 flex gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Restore Restricted</span>
                      <p className="text-[9px] text-rose-800 mt-0.5 leading-relaxed">
                        Role ({userRole}) is not permitted to import state backups. Log in as Admin.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCancelPending}
                    className="py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={!isAdmin}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1 transition-all ${
                      isAdmin 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white hover:cursor-pointer shadow-sm shadow-rose-600/10' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restore State</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TURSO DATABASE INTEGRATION PANEL */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-150">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 font-sans uppercase tracking-wider">Turso Cloud DB</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Connect and sync state with a real-time serverless SQLite database</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold uppercase">
            libsql client
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CONFIG & OPERATIONS PANEL */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">
                  Database URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tursoUrl}
                    onChange={(e) => setTursoUrl(e.target.value)}
                    placeholder="libsql://your-db-username.turso.io"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">
                  Auth Token (JWT)
                </label>
                <input
                  type="password"
                  value={tursoToken}
                  onChange={(e) => setTursoToken(e.target.value)}
                  placeholder="Paste your Turso security token..."
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* ACTION STATUSES */}
            <div className="space-y-2">
              {tursoTestResult && (
                <div className={`p-2 rounded-lg text-[10px] border flex items-start gap-1.5 ${
                  tursoTestResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {tursoTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="font-mono">{tursoTestResult.message}</span>
                </div>
              )}

              {tursoInitResult && (
                <div className={`p-2 rounded-lg text-[10px] border flex items-start gap-1.5 ${
                  tursoInitResult.success 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {tursoInitResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="font-mono">{tursoInitResult.message}</span>
                </div>
              )}

              {tursoSyncResult && (
                <div className={`p-2 rounded-lg text-[10px] border flex items-start gap-1.5 ${
                  tursoSyncResult.success 
                    ? 'bg-teal-50 border-teal-200 text-teal-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {tursoSyncResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="font-mono">{tursoSyncResult.message}</span>
                </div>
              )}

              {tursoLoadResult && (
                <div className={`p-2 rounded-lg text-[10px] border flex items-start gap-1.5 ${
                  tursoLoadResult.success 
                    ? 'bg-sky-50 border-sky-200 text-sky-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {tursoLoadResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="font-mono">{tursoLoadResult.message}</span>
                </div>
              )}
            </div>

            {/* BUTTONS GRID */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTestConnection}
                disabled={tursoLoading || !tursoUrl}
                className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 animate-pulse" />
                <span>Test Link</span>
              </button>

              <button
                onClick={handleInitTables}
                disabled={tursoLoading || !tursoUrl}
                className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-950 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Init Tables</span>
              </button>

              <button
                onClick={handleSyncStateToTurso}
                disabled={tursoLoading || !tursoUrl}
                className="py-1.5 px-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Sync PUSH</span>
              </button>

              <button
                onClick={handleLoadStateFromTurso}
                disabled={tursoLoading || !tursoUrl}
                className="py-1.5 px-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sync PULL</span>
              </button>
            </div>
            <p className="text-[9px] text-gray-400 font-sans italic text-center">
              Note: Synchronizing saves your local state / registers to the cloud.
            </p>
          </div>

          {/* SQL LIVE COMMAND CONSOLE */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-500 uppercase">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  <span>SQL Live Console</span>
                </label>
                <button
                  onClick={handleExecuteSqlQuery}
                  disabled={tursoLoading || !tursoUrl}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-150 disabled:text-gray-400 text-white text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Run Query</span>
                </button>
              </div>
              
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full h-20 p-2 bg-zinc-900 text-zinc-100 text-[11px] font-mono rounded-lg border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-inner"
                placeholder="Write your custom SQL here..."
              />
            </div>

            {/* SQL RESULTS AREA */}
            <div className="flex-1 min-h-[140px] bg-zinc-950 border border-zinc-900 rounded-lg p-3 overflow-auto flex flex-col justify-between max-h-[220px]">
              <div>
                <span className="text-[9px] font-mono font-semibold text-zinc-500 uppercase block mb-1.5 border-b border-zinc-900 pb-1">
                  Query Execution Log & Output
                </span>
                
                {sqlResult ? (
                  sqlResult.success ? (
                    sqlResult.rows && sqlResult.rows.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-zinc-300 font-mono text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 text-zinc-400 text-[9px] uppercase">
                              {sqlResult.columns.map((col, idx) => (
                                <th key={idx} className="pb-1 px-1.5 font-bold">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sqlResult.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-zinc-900/50 hover:bg-zinc-900/50">
                                {sqlResult.columns.map((col, cIdx) => {
                                  const cellVal = row[col];
                                  const renderVal = typeof cellVal === 'object' && cellVal !== null 
                                    ? (JSON.stringify(cellVal).length > 20 ? JSON.stringify(cellVal).substring(0, 20) + '...' : JSON.stringify(cellVal))
                                    : String(cellVal);
                                  return (
                                    <td key={cIdx} className="py-1 px-1.5 font-mono text-zinc-300 max-w-[120px] truncate" title={String(cellVal)}>
                                      {renderVal}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-emerald-400">
                        {sqlResult.message || "Query executed successfully. (0 rows returned)"}
                        {sqlResult.affectedRows !== undefined && ` [Affected: ${sqlResult.affectedRows}]`}
                      </div>
                    )
                  ) : (
                    <div className="text-[10px] font-mono text-rose-400 leading-normal break-all">
                      ❌ ERROR: {sqlResult.message}
                    </div>
                  )
                ) : (
                  <div className="text-[10px] font-mono text-zinc-500 italic">
                    {tursoLoading ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                        <span>Communicating with Turso Server...</span>
                      </span>
                    ) : (
                      "Awaiting execution. Run 'Test Link' or run a query above (e.g. SELECT * FROM it_assets_logs;)"
                    )}
                  </div>
                )}
              </div>

              {sqlResult && sqlResult.success && (
                <div className="text-[8px] font-mono text-zinc-600 text-right mt-1 border-t border-zinc-900/50 pt-1">
                  Returned {sqlResult.rows?.length || 0} rows | Affected: {sqlResult.affectedRows ?? 0}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
