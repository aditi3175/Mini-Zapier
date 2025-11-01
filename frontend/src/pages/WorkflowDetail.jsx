import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Modal from "../components/Modal.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { ArrowLeft } from "lucide-react";

function Toast({ open, kind = "info", message }) {
  if (!open) return null;
  const bg = kind === "error" ? "bg-red-600" : kind === "success" ? "bg-emerald-600" : "bg-slate-800";
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-3 py-2 rounded text-white shadow ${bg}`}>{message}</div>
  );
}

export default function WorkflowDetail() {
  const { theme } = useTheme();
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [actions, setActions] = useState([]);
  const [payload, setPayload] = useState("{\n  \"user\": { \"email\": \"test@example.com\" }\n}");
  const [triggerModal, setTriggerModal] = useState(false);
  const [triggerType, setTriggerType] = useState("webhook");
  const [triggerConfig, setTriggerConfig] = useState("{}");
  const [scheduleMode, setScheduleMode] = useState("every"); // every | cron
  const [scheduleMinutes, setScheduleMinutes] = useState(5);
  const [scheduleCron, setScheduleCron] = useState("0 * * * *");
  const [previewResult, setPreviewResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Jobs state for recent runs
  const [jobs, setJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [toast, setToast] = useState({ open: false, kind: "info", message: "" });

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`/api/jobs`, { params: { workflowId: id, limit: 10 } });
      setJobs(data.jobs || []);
    } catch {}
  };

  const load = async () => {
    const [wf, ts, as] = await Promise.all([
      axios.get(`/api/workflows/${id}`),
      axios.get(`/api/workflows/triggers/${id}`),
      axios.get(`/api/workflows/actions/${id}`),
    ]);
    setWorkflow(wf.data.workflow);
    setTriggers(ts.data.triggers || []);
    setActions(as.data.actions || []);
  };

  useEffect(() => { 
    load(); 
    fetchJobs();
    const t = setInterval(fetchJobs, 4000);
    return () => clearInterval(t);
  }, [id]);

  return (
    <div className="h-full">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/workflows" 
              className={`inline-flex items-center justify-center rounded-md p-2 transition ${theme === "dark" ? "text-gray-300 hover:bg-slate-800 hover:text-gray-100" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
              title="Back to Workflows"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className={`text-2xl font-semibold flex items-center gap-3 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>
              {workflow?.name || "Workflow"}
              {workflow?.enabled === false && (
                <span className={`text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-slate-700 text-gray-300" : "bg-slate-100 text-slate-700"}`}>Disabled</span>
              )}
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600" onClick={async ()=>{
              try {
                const parsed = JSON.parse(payload || "{}");
                await axios.post("/api/workflows/trigger", { workflowId: Number(id), actions, payload: parsed });
                setToast({ open: true, kind: "info", message: "Workflow queued…" });
                setTimeout(()=>setToast(s=>({ ...s, open:false })), 1500);
              } catch (e) {
                alert(e.response?.data?.message || e.message);
              }
            }}>Run Test</button>
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-slate-700 hover:bg-slate-600" onClick={async ()=>{
              try {
                const toggled = !(workflow?.enabled);
                const { data } = await axios.put(`/api/workflows/${id}`, { enabled: toggled });
                setWorkflow(data.workflow);
              } catch(e) {
                alert(e.response?.data?.message || e.message);
              }
            }}>{workflow?.enabled ? "Disable" : "Enable"}</button>
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-red-600 hover:bg-red-500" onClick={async ()=>{
              if (!confirm("Delete this workflow? This cannot be undone.")) return;
              try {
                await axios.delete(`/api/workflows/${id}`);
                window.location.replace('/workflows');
              } catch (e) {
                alert(e.response?.data?.message || e.message);
              }
            }}>Delete</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr_22rem] gap-4">
          {/* Left: Triggers */}
          <div className={`border rounded-2xl backdrop-blur shadow-lg p-3 space-y-2 ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
            <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Triggers</div>
            {triggers.length === 0 ? (
              <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>No triggers yet. Add one to start your workflow.</div>
            ) : (
              <div className="space-y-2 text-sm">
                {triggers.map(t => (
                  <div key={t.id} className={`border rounded p-2 ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`font-medium mb-1 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>{t.type === 'webhook' ? 'Webhook Trigger' : 'Schedule Trigger'}</div>
                    {t.type === 'webhook' ? (
                      <div className="space-y-2">
                        <div>
                          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Send POST requests to:</div>
                          <div className={`p-2 rounded text-xs font-mono break-all ${theme === "dark" ? "bg-slate-900 text-cyan-400" : "bg-white text-cyan-600"}`}>
                            {`${import.meta.env?.VITE_API_URL || "http://localhost:3000"}/api/webhooks/${id}`}
                          </div>
                          <button 
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                            onClick={() => {
                              const url = `${import.meta.env?.VITE_API_URL || "http://localhost:3000"}/api/webhooks/${id}`;
                              navigator.clipboard.writeText(url);
                              setToast({ open: true, kind: "success", message: "Webhook URL copied!" });
                              setTimeout(() => setToast(s => ({ ...s, open: false })), 2000);
                            }}
                          >
                            Copy URL
                          </button>
                        </div>
                        {workflow?.secret && (
                          <div>
                            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Webhook Secret (add to request body):</div>
                            <div className={`p-2 rounded text-xs font-mono break-all ${theme === "dark" ? "bg-slate-900 text-emerald-400" : "bg-white text-emerald-600"}`}>
                              {workflow.secret}
                            </div>
                            <button 
                              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                              onClick={() => {
                                navigator.clipboard.writeText(workflow.secret);
                                setToast({ open: true, kind: "success", message: "Secret copied!" });
                                setTimeout(() => setToast(s => ({ ...s, open: false })), 2000);
                              }}
                            >
                              Copy Secret
                            </button>
                            <div className={`text-xs mt-1 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                              ⚠️ Include this secret in request body as "workflowSecret"
                            </div>
                          </div>
                        )}
                        <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                          💡 <strong>Real use:</strong> Add this URL to your backend code. When events happen (order placed, payment received, etc.), your server will automatically call this endpoint.
                        </div>
                        <details className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>
                          <summary className="cursor-pointer hover:text-cyan-400">Example code</summary>
                          <pre className={`mt-1 p-2 rounded text-xs overflow-x-auto ${theme === "dark" ? "bg-slate-900 text-gray-300" : "bg-white text-slate-800"}`}>{`// In your backend (Node.js example)
app.post('/order-complete', async (req, res) => {
  const order = req.body;
  
  // Save order
  await saveOrder(order);
  
  // Trigger Mini Zapier automatically (include secret!)
  await axios.post(
    '${import.meta.env?.VITE_API_URL || "http://localhost:3000"}/api/webhooks/${id}',
    { 
      workflowSecret: '${workflow?.secret || "YOUR_SECRET"}',
      user: order.customer, 
      order: order 
    }
  );
  
  res.json({ success: true });
});`}</pre>
                        </details>
                      </div>
                    ) : (
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                        {t.config?.mode === 'every' 
                          ? `Runs every ${t.config.minutes || 'N'} minutes`
                          : `Cron: ${t.config.cron || 'N/A'}`
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600" onClick={()=>setTriggerModal(true)}>+ Add Trigger</button>
          </div>

          {/* Center: Flow view */}
          <div className={`border rounded-2xl backdrop-blur shadow-lg p-4 min-h-[420px] ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
            <div className={`font-medium mb-2 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Flow Builder</div>
            {triggers.length === 0 && actions.length === 0 ? (
              <div className={`grid place-items-center h-[340px] text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                <div className="text-center">
                  <div>No steps yet.</div>
                  <div className="mt-1">Add a trigger on the left, then actions on the right.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {triggers.map((t) => (
                  <div key={`trigger-${t.id}`} className={`border rounded px-3 py-2 inline-block ${theme === "dark" ? "bg-emerald-700 text-white border-emerald-600" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                    Trigger: {t.type}
                  </div>
                ))}
                {actions.map((a, i) => (
                  <div key={`action-${a.id}`} className={`border rounded px-3 py-2 inline-block ${theme === "dark" ? "bg-cyan-700 text-white border-cyan-600" : "bg-indigo-50 text-indigo-800 border-indigo-200"}`}>
                    Action {i+1}: {a.type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Test data + Add Action */}
          <div className={`border rounded-2xl backdrop-blur shadow-lg p-3 space-y-3 ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
            <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Test data</div>
            <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Click Run Test above to execute with empty data. For advanced testing, you can open the JSON editor.</div>
            <button className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600" onClick={()=>setShowAdvanced(s=>!s)}>{showAdvanced ? 'Hide advanced JSON' : 'Show advanced JSON'}</button>
            {showAdvanced && (
              <div className="space-y-1">
                <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Sample event payload (JSON)</label>
                <textarea
                  className={`w-full border rounded-md px-3 py-2 font-mono text-sm h-40 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`}
                  value={payload}
                  onChange={(e)=>setPayload(e.target.value)}
                />
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>Advanced users: this JSON simulates what your webhook would send.</p>
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600"
                  onClick={async ()=>{
                    try {
                      if (!actions.length) { alert("No actions to preview"); return; }
                      const parsed = JSON.parse(payload || "{}");
                      const { data } = await axios.post("/api/workflows/actions/preview", { actionId: actions[0].id, payload: parsed });
                      setPreviewResult(data.resolved);
                    } catch (e) {
                      alert(e.response?.data?.message || e.message);
                    }
                  }}>Preview Action</button>
                {previewResult ? (
                  <pre className={`text-xs whitespace-pre-wrap break-all ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>{JSON.stringify(previewResult, null, 2)}</pre>
                ) : null}
              </div>
            )}

            <div className={`h-px ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />
            <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Recent Runs</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jobs.length === 0 ? (
                <div className={`${theme === "dark" ? "text-gray-400" : "text-slate-600"} text-sm`}>No runs yet. Click "Run Test" to execute workflow.</div>
              ) : jobs.map(j => (
                <div key={j.id} className={`border rounded p-2 ${theme === "dark" ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={()=>setExpandedJob(expandedJob === j.id ? null : j.id)}>
                    <div className="flex-1">
                      <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>#{j.id} · {new Date(j.createdAt).toLocaleTimeString()}</div>
                      {j.result?.actions?.[0]?.info?.previewUrl ? (
                        <a href={j.result.actions[0].info.previewUrl} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="text-xs text-cyan-400 underline">Email preview</a>
                      ) : j.result?.actions?.[0]?.type === 'webhook' ? (
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Webhook sent to: {j.result?.actions?.[0]?.config?.url?.slice(0,40)}...</div>
                      ) : j.result?.actions?.[0]?.type === 'slackMessage' ? (
                        <div className={`text-xs ${j.result?.actions?.[0]?.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {j.result?.actions?.[0]?.ok ? '✓ Slack message sent' : `✗ ${j.result?.actions?.[0]?.error || 'Failed'}`}
                        </div>
                      ) : null}
                      {j.lastError ? <div className="text-xs text-red-400 mt-1">{j.lastError}</div> : null}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${j.status === 'SUCCESS' ? 'bg-emerald-600 text-white' : j.status === 'FAILED' ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-200'}`}>{j.status}</span>
                  </div>
                  {expandedJob === j.id && (
                    <div className={`mt-2 pt-2 border-t ${theme === "dark" ? "border-slate-700" : "border-slate-200"} space-y-2`}>
                      <div>
                        <div className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>Payload Sent:</div>
                        <pre className={`text-xs p-2 rounded overflow-x-auto ${theme === "dark" ? "bg-slate-900 text-gray-300" : "bg-slate-50 text-slate-800"}`}>{JSON.stringify(j.payload || {}, null, 2)}</pre>
                      </div>
                      {j.result?.actions?.length > 0 && (
                        <div>
                          <div className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>Action Results:</div>
                          {j.result.actions.map((action, idx) => (
                            <div key={idx} className={`text-xs p-2 rounded mb-1 ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}>
                              <div className={`font-medium ${action.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                {action.type} {action.ok ? '✓' : '✗'}
                              </div>
                              {!action.ok && action.error && (
                                <div className="text-red-400 mt-1">Error: {action.error}</div>
                              )}
                              {action.message && (
                                <div className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>{action.message}</div>
                              )}
                              {action.config && (
                                <pre className={`mt-1 overflow-x-auto ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>{JSON.stringify(action.config, null, 2)}</pre>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`h-px ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />
            <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Add Action</div>
            <AddActionForm workflowId={id} onAdded={load} theme={theme} />
          </div>
        </div>
      </div>
      <Modal open={triggerModal} title="Add Trigger" onClose={()=>setTriggerModal(false)} theme={theme}>
        <div className="space-y-3">
           <div>
             <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Type</label>
             <select className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={triggerType} onChange={(e)=>setTriggerType(e.target.value)}>
               <option value="webhook">Webhook (incoming HTTP)</option>
               <option value="schedule">Schedule</option>
             </select>
           </div>
           {triggerType === "webhook" ? (
             <div className={`text-sm space-y-2 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
               <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-800"}`}>Incoming Webhook</div>
               <p>Send POST requests to this endpoint to trigger the workflow:</p>
               <pre className={`p-2 border rounded select-all overflow-x-auto ${theme === "dark" ? "bg-slate-800 border-slate-700 text-gray-300" : "bg-slate-50 border-slate-200 text-slate-900"}`}>{`${import.meta.env?.VITE_API_URL || "http://localhost:3000"}/api/webhooks/${id}`}</pre>
               <p className="text-xs">No extra configuration needed. Optionally include a JSON body; it will be available as <code>payload</code> in actions.</p>
             </div>
           ) : (
             <div className="space-y-3">
               <div>
                 <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Schedule mode</label>
                 <select className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={scheduleMode} onChange={(e)=>setScheduleMode(e.target.value)}>
                   <option value="every">Every N minutes</option>
                   <option value="cron">Cron expression</option>
                 </select>
               </div>
               {scheduleMode === "every" ? (
                 <div>
                   <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Every (minutes)</label>
                   <input type="number" min={1} className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={scheduleMinutes} onChange={(e)=>setScheduleMinutes(Number(e.target.value)||1)} />
                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>The workflow will run every {scheduleMinutes} minute(s).</p>
                 </div>
               ) : (
                 <div>
                   <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Cron</label>
                   <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={scheduleCron} onChange={(e)=>setScheduleCron(e.target.value)} placeholder="e.g. 0 * * * * (hourly)" />
                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>Use standard 5-field cron. Example: <code>0 9 * * 1-5</code> (weekdays at 09:00).</p>
                 </div>
               )}
             </div>
           )}
          <div className="flex justify-end gap-2">
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-slate-700 hover:bg-slate-600" onClick={()=>setTriggerModal(false)}>Cancel</button>
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600" onClick={async ()=>{
              try {
                let config = {};
                if (triggerType === "schedule") {
                  config = scheduleMode === "every" ? { mode: "every", minutes: Number(scheduleMinutes)||1 } : { mode: "cron", cron: scheduleCron };
                }
                const { data } = await axios.post("/api/workflows/triggers", { workflowId: Number(id), type: triggerType, config });
                setTriggerModal(false);
                setTriggerConfig("{}");
                // optimistic update
                if (data?.trigger) {
                  setTriggers(prev => [...prev, data.trigger]);
                } else {
                  load();
                }
              } catch (e) {
                alert(e.response?.data?.message || e.message);
              }
            }}>Add Trigger</button>
          </div>
        </div>
      </Modal>
      <Toast open={toast.open} kind={toast.kind} message={toast.message} />
    </div>
  );
}


function AddActionForm({ workflowId, onAdded, theme = "dark" }) {
  const [type, setType] = useState('sendEmail');
  const [orderIndex, setOrderIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Field states per action type
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Hello');
  const [emailBody, setEmailBody] = useState('Welcome!');

  const [slackUrl, setSlackUrl] = useState('');
  const [slackText, setSlackText] = useState('New event: {{payload.user.email}}');

  const [whUrl, setWhUrl] = useState('');
  const [whMethod, setWhMethod] = useState('POST');
  const [whHeaders, setWhHeaders] = useState('{"Content-Type":"application/json"}');

  const buildConfig = () => {
    if (type === 'sendEmail') {
      return { to: emailTo, subject: emailSubject, body: emailBody };
    }
    if (type === 'slackMessage') {
      return { webhookUrl: slackUrl, text: slackText };
    }
    if (type === 'webhook') {
      let headers = {};
      try { headers = JSON.parse(whHeaders || '{}'); } catch { headers = {}; }
      return { url: whUrl, method: whMethod, headers };
    }
    return {};
  };

  const baseField = `border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`;
  const inputClass = `w-full ${baseField}`;
  const selectClass = `w-48 flex-none ${baseField}`;
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Type</label>
          <select className={selectClass} value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="sendEmail">Email</option>
            <option value="slackMessage">Slack message</option>
            <option value="webhook">Outgoing webhook</option>
          </select>
        </div>
        <div>
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Order</label>
          <input className={inputClass} type="number" value={orderIndex} onChange={(e)=>setOrderIndex(Number(e.target.value)||0)} />
        </div>
      </div>

      {type === 'sendEmail' && (
        <div className="space-y-2">
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>To</label>
            <div className="flex gap-2">
              <select className={selectClass} onChange={(e)=>{ const v = e.target.value; if (v) setEmailTo(v); e.target.selectedIndex = 0; }}>
                <option value="">Insert variable…</option>
                <option value="{{payload.user.email}}">User email (from webhook)</option>
              </select>
              <input className={`${inputClass} flex-1 min-w-0`} value={emailTo} onChange={(e)=>setEmailTo(e.target.value)} placeholder="recipient@example.com" />
            </div>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>Enter a real email or insert a variable that's filled from incoming data.</p>
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Subject</label>
            <input className={inputClass} value={emailSubject} onChange={(e)=>setEmailSubject(e.target.value)} />
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Body</label>
            <textarea className={`${inputClass} h-24`} value={emailBody} onChange={(e)=>setEmailBody(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'slackMessage' && (
        <div className="space-y-2">
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Webhook URL</label>
            <input className={inputClass} value={slackUrl} onChange={(e)=>setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." />
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Text</label>
            <input className={inputClass} value={slackText} onChange={(e)=>setSlackText(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'webhook' && (
        <div className="space-y-2">
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>URL</label>
            <input className={inputClass} value={whUrl} onChange={(e)=>setWhUrl(e.target.value)} placeholder="https://example.com/endpoint" />
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Method</label>
            <select className={selectClass} value={whMethod} onChange={(e)=>setWhMethod(e.target.value)}>
              <option>POST</option>
              <option>GET</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Headers (JSON)</label>
            <textarea className={`${inputClass} h-20 font-mono`} value={whHeaders} onChange={(e)=>setWhHeaders(e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button disabled={loading} className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60" onClick={async ()=>{
          try {
            setLoading(true);
            const config = buildConfig();
            const { data } = await axios.post('/api/workflows/actions', { workflowId: Number(workflowId), type, config, orderIndex: Number(orderIndex)||0 });
            if (typeof onAdded === 'function') {
              await onAdded();
            }
            // Clear minimal fields for better UX
            if (type === 'sendEmail') {
              // keep address as user may add multiple; only clear subject/body
              setEmailSubject('');
              setEmailBody('');
            }
          } catch(e) {
            alert(e.response?.data?.message || e.message);
          } finally {
            setLoading(false);
          }
        }}>{loading ? 'Adding...' : 'Add Action'}</button>
      </div>
      <p className="text-xs text-slate-500">
        Tip: Use {'{{payload...}}'} to pull values from the incoming webhook body or the sample payload above.
      </p>
    </div>
  );
}


