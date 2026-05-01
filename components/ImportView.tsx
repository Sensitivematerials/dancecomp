"use client";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Button from "./ui/Button";
import SectionLabel from "./ui/SectionLabel";
const REQUIRED = ["number","studio","title","division"];
const OPTIONAL = ["dancers","age_group","music_file","notes"];
const ALL = [...REQUIRED,...OPTIONAL];
const LABELS: Record<string,string> = {
  number:"Routine #",studio:"Studio",title:"Routine Title",division:"Division",
  dancers:"Dancer Names",age_group:"Age Group",music_file:"Music File",notes:"Notes"
};
const ALIASES: Record<string,string[]> = {
  number:["number","#","routine #","routine number","entry","entry #","num","no","order"],
  studio:["studio","studio name","school","company","organization"],
  title:["title","routine title","routine name","song","song name","name","piece"],
  division:["division","category","class","level","style","type"],
  dancers:["dancer","dancers","performer","performers","name","names","student","students"],
  age_group:["age","age group","age division","age category"],
  music_file:["music","music file","track","song file","audio","file"],
  notes:["notes","note","comments","comment","memo","special"]
};
function autoDetect(headers: string[]) {
  const map: Record<string,string> = {};
  const lc = headers.map(h => h.toLowerCase().trim());
  ALL.forEach(f => { const idx = lc.findIndex(h => ALIASES[f].includes(h)); if (idx !== -1) map[f] = headers[idx]; });
  return map;
}
interface Props { onImport:(rows:any[])=>Promise<void>; onReset?:()=>void; }
const PREVIEW = 8;
export default function ImportView({ onImport, onReset }: Props) {
  const [rawRows,setRawRows] = useState<Record<string,any>[]|null>(null);
  const [headers,setHeaders] = useState<string[]>([]);
  const [mapping,setMapping] = useState<Record<string,string>>({});
  const [fileName,setFileName] = useState("");
  const [dragOver,setDragOver] = useState(false);
  const [importing,setImporting] = useState(false);
  const [tab,setTab] = useState<"file"|"sheets">("file");
  const [sheetsUrl,setSheetsUrl] = useState("");
  const [sheetsLoading,setSheetsLoading] = useState(false);
  const [sheetsError,setSheetsError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function parse(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string,any>>(ws, { defval:"" });
        if (!rows.length) return;
        const hdrs = Object.keys(rows[0]);
        setHeaders(hdrs); setRawRows(rows); setMapping(autoDetect(hdrs)); setFileName(file.name);
      } catch { alert("Could not read file. Make sure it is a valid .xlsx or .csv."); }
    };
    reader.readAsArrayBuffer(file);
  }

  async function importFromSheets() {
    setSheetsError("");
    const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) { setSheetsError("Paste a valid Google Sheets URL"); return; }
    const sheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    setSheetsLoading(true);
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Could not fetch sheet. Make sure sharing is set to Anyone with the link can view");
      const text = await res.text();
      const wb = XLSX.read(text, { type:"string" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string,any>>(ws, { defval:"" });
      if (!rows.length) throw new Error("Sheet appears empty");
      const hdrs = Object.keys(rows[0]);
      setHeaders(hdrs); setRawRows(rows); setMapping(autoDetect(hdrs)); setFileName("Google Sheets");
    } catch(err: any) { setSheetsError(err.message || "Could not load sheet"); }
    setSheetsLoading(false);
  }

  const previewRows = useMemo(() => {
    if (!rawRows || !mapping.number) return [];
    return rawRows.map((row,i) => {
      const r: Record<string,any> = { _err:false, _i:i };
      ALL.forEach(f => { r[f] = mapping[f] ? String(row[mapping[f]] ?? "").trim() : ""; });
      r._err = !r.number;
      return r;
    });
  }, [rawRows, mapping]);

  const valid = previewRows.filter(r => !r._err);
  const invalid = previewRows.filter(r => r._err);
  const missing = REQUIRED.filter(f => !mapping[f]);

  async function handleImport() {
    setImporting(true);
    await onImport(valid.map(({ _err, _i, ...r }) => r));
    setImporting(false);
    reset();
  }

  function reset() {
    setRawRows(null); setHeaders([]); setMapping({}); setFileName("");
    setSheetsUrl(""); setSheetsError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Routine #","Studio","Routine Title","Division","Dancer Names","Age Group","Music File","Notes"],
      ["101","Example Dance Studio","Midnight City","Teen Solo","Jane Smith","Teen","midnight_city.mp3",""],
      ["102","Star Bound","Electric Feel","Mini Duo","Alice / Bob","Mini","electric_feel.mp3",""],
    ]);
    ws["!cols"] = [10,22,22,16,20,12,22,16].map(w => ({ wch:w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Routines");
    XLSX.writeFile(wb, "dancecomp-template.xlsx");
  }

  const valStatus = missing.length > 0 ? "err" : invalid.length > 0 ? "warn" : "ok";
  const valMsg = missing.length > 0
    ? `Map required columns first: ${missing.map(f => LABELS[f]).join(", ")}`
    : invalid.length > 0
    ? `${valid.length} routines ready · ${invalid.length} rows missing routine number (skipped)`
    : `${valid.length} routines ready to import`;

  if (rawRows) return (
    <div>
      <SectionLabel>Import Routines</SectionLabel>
      <div className="flex items-center gap-3 rounded-[10px] border p-3.5 mb-5"
        style={{ background:"rgba(32,212,156,0.09)", borderColor:"rgba(32,212,156,0.26)" }}>
        <span className="text-[20px]">{fileName==="Google Sheets"?"📊":"✅"}</span>
        <span className="flex-1 text-[14px] font-semibold text-emerald-400 truncate">{fileName}</span>
        <span className="font-mono text-[12px] text-gray-500 whitespace-nowrap">{rawRows.length} rows</span>
        <Button variant="ghost" size="sm" onClick={reset}>✕ Clear</Button>
      </div>
      <div className="mb-5">
        <div className="text-[15px] font-semibold mb-1">Map Your Columns</div>
        <div className="text-[13px] text-gray-500 mb-4">Match your file headers to each field. Required fields marked ✱</div>
        <div className="grid grid-cols-2 gap-2.5">
          {ALL.map(field => {
            const req = REQUIRED.includes(field);
            const isMapped = !!mapping[field];
            const isMissing = req && !mapping[field];
            return (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-gray-500 flex gap-1.5">
                  {LABELS[field]}{req && <span className="text-red-400">✱</span>}
                </label>
                <select
                  className={`h-[44px] rounded-[8px] border px-3 text-[14px] outline-none appearance-none cursor-pointer bg-[var(--card)] ${isMapped?"border-emerald-400/25 text-white":isMissing?"border-red-400/25 text-gray-400":"text-gray-400"}`}
                  style={{ borderColor: isMapped?undefined:isMissing?undefined:"var(--border)" }}
                  value={mapping[field] ?? ""}
                  onChange={e => setMapping(m => ({ ...m, [field]:e.target.value||"" }))}>
                  <option value="">— not mapped —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3 mb-4 text-[13px] font-medium
        ${valStatus==="ok"?"bg-emerald-400/10 border-emerald-400/25 text-emerald-400":valStatus==="warn"?"bg-amber-400/10 border-amber-400/25 text-amber-400":"bg-red-400/10 border-red-400/25 text-red-400"}`}>
        <span>{valStatus==="ok"?"✓":valStatus==="warn"?"⚠":"✕"}</span>{valMsg}
      </div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Preview</SectionLabel>
          <span className="font-mono text-[11px] text-gray-500">{previewRows.length} rows · first {Math.min(PREVIEW,previewRows.length)} shown</span>
        </div>
        <div className="overflow-x-auto rounded-[14px] border" style={{ borderColor:"var(--border)" }}>
          <table className="w-full border-collapse text-[13px]" style={{ minWidth:500 }}>
            <thead style={{ background:"var(--card2)" }}>
              <tr>
                {["#","Studio","Title","Division",...(mapping.dancers?["Dancers"]:[]),...(mapping.age_group?["Age"]:[])].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[9px] tracking-[1.5px] uppercase text-gray-500 border-b whitespace-nowrap" style={{ borderColor:"var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0,PREVIEW).map((r,i) => (
                <tr key={i} style={{ background:r._err?"rgba(255,82,88,0.08)":undefined }}>
                  <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>
                    <span className={`font-display text-[20px] leading-none ${r._err?"text-red-400":"text-amber-400"}`}>
                      {r.number || <span className="text-[12px] italic text-gray-600">missing</span>}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>{r.studio||<span className="text-gray-600 text-[12px] italic">—</span>}</td>
                  <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>{r.title||<span className="text-gray-600 text-[12px] italic">—</span>}</td>
                  <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>{r.division||<span className="text-gray-600 text-[12px] italic">—</span>}</td>
                  {mapping.dancers && <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>{r.dancers||"—"}</td>}
                  {mapping.age_group && <td className="px-3.5 py-2.5 border-b" style={{ borderColor:"var(--border)" }}>{r.age_group||"—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {previewRows.length > PREVIEW && (
            <div className="text-center py-3 font-mono text-[11px] text-gray-600 border-t" style={{ borderColor:"var(--border)", background:"var(--card)" }}>
              … and {previewRows.length - PREVIEW} more rows
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2.5 pb-24">
        <Button variant="green" fullWidth disabled={missing.length>0||valid.length===0||importing} onClick={handleImport}>
          {importing ? "Importing…" : `✓ Import ${valid.length} Routine${valid.length!==1?"s":""}`}
        </Button>
        <Button variant="ghost" fullWidth onClick={reset}>Cancel</Button>
      </div>
    </div>
  );

  return (
    <div>
      <SectionLabel>Import Routines</SectionLabel>
      <div className="flex rounded-[10px] p-1 gap-0.5 border mb-5" style={{ background:"var(--card)", borderColor:"var(--border)" }}>
        {(["file","sheets"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSheetsError(""); }}
            className={`flex-1 h-[38px] rounded-[8px] text-[13px] font-semibold transition-all ${tab===t?"text-white":"text-gray-500"}`}
            style={tab===t?{background:"var(--border2)"}:{}}>
            {t==="file"?"📂 File Upload":"📊 Google Sheets"}
          </button>
        ))}
      </div>
      {tab==="file" ? (
        <>
          <div className="flex items-center gap-3 rounded-[10px] border p-4 mb-4" style={{ background:"var(--card)", borderColor:"var(--border)" }}>
            <div className="text-[28px]">📄</div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold mb-0.5">Need a template?</div>
              <div className="text-[13px] text-gray-500">Download our Excel template with pre-filled headers.</div>
            </div>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>↓ Template</Button>
          </div>
          <div className="flex items-start gap-3 rounded-[10px] border p-4 mb-5" style={{ background:"rgba(91,159,255,0.07)", borderColor:"rgba(91,159,255,0.25)" }}>
            <span className="text-[20px] mt-0.5">📱</span>
            <div className="text-[13px] text-blue-300 leading-relaxed">
              <strong className="text-white">On Android/iPhone:</strong> Download the file from Google Drive or email first, then tap below to pick it from your Downloads folder.
            </div>
          </div>
          <div
            className={`relative rounded-[18px] border-2 border-dashed p-12 text-center cursor-pointer transition-all ${dragOver?"border-pink-400/40 bg-pink-400/5":"border-[var(--border2)] hover:border-pink-400/30"}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) parse(f); }}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) parse(f); }} />
            <div className="text-[40px] mb-3">📂</div>
            <div className="text-[17px] font-semibold mb-1.5">Tap to pick a file</div>
            <div className="text-[13px] text-gray-500">or drop it here on desktop</div>
            <div className="flex gap-2 justify-center mt-4">
              {[".xlsx",".xls",".csv"].map(f => (
                <span key={f} className="font-mono text-[10px] px-2.5 py-1 rounded-full border text-gray-500" style={{ borderColor:"var(--border2)" }}>{f}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[16px] border p-5" style={{ background:"var(--card)", borderColor:"var(--border)" }}>
          <div className="text-[15px] font-semibold mb-1">Google Sheets URL</div>
          <div className="text-[13px] text-gray-500 mb-4 leading-relaxed">
            Paste the share link from your Google Sheet. Make sure sharing is set to <strong className="text-white">Anyone with the link can view</strong>.
          </div>
          <div className="rounded-[10px] border p-4 mb-4 text-[13px] text-gray-400 leading-relaxed" style={{ background:"var(--surface)", borderColor:"var(--border2)" }}>
            <div className="font-semibold text-white mb-2">How to get the link:</div>
            <div>1. Open your Google Sheet</div>
            <div>2. Tap <strong className="text-white">Share</strong> → <strong className="text-white">Change to anyone with the link</strong></div>
            <div>3. Copy the link and paste below</div>
          </div>
          <input type="url" placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full h-[52px] rounded-[10px] border px-4 text-[14px] outline-none placeholder-gray-600 mb-3"
            style={{ background:"var(--surface)", borderColor:sheetsError?"rgba(255,82,88,0.4)":"var(--border)", color:"var(--text)" }}
            value={sheetsUrl}
            onChange={e => { setSheetsUrl(e.target.value); setSheetsError(""); }}
            onKeyDown={e => e.key==="Enter" && importFromSheets()} />
          {sheetsError && <div className="text-[13px] text-red-400 mb-3 flex items-center gap-2"><span>⚠</span>{sheetsError}</div>}
          <button onClick={importFromSheets} disabled={!sheetsUrl.trim()||sheetsLoading}
            className="w-full h-[50px] rounded-[10px] font-bold text-[15px] transition-all disabled:opacity-30"
            style={{ background:"rgba(91,159,255,0.15)", border:"1.5px solid rgba(91,159,255,0.35)", color:"#5b9fff" }}>
            {sheetsLoading ? "Loading Sheet..." : "📊 Import from Google Sheets"}
          </button>
        </div>
      )}
    </div>
  );
}
