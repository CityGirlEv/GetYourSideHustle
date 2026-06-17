import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Loader2,
  RotateCcw,
  Save,
  History,
  Bold,
  Italic,
  Underline,
  Link2,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Send,
  Inbox,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
} from "lucide-react";
import {
  listEmailTemplates,
  getEmailTemplateCatalog,
  getEmailTemplate,
  saveEmailTemplateOverride,
  deleteEmailTemplateOverride,
  listEmailTemplateVersions,
  getEmailTemplateVersion,
  sendEmailTemplateTest,
  listEmailSendLog,
  listEmailTemplateChanges,
  getEmailDeliveryStatus,
} from "@/lib/email-template-admin.functions";
import {
  sortEmailLog,
  type EmailLogSortKey,
  type SortDir,
  type EmailLogRow,
} from "@/lib/email-log-sort";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";

export const Route = createFileRoute("/admin_/email-templates")({
  head: () => ({
    meta: [{ title: "Email Templates — Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: EmailTemplatesAdminPage,
});

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function EmailTemplateCatalogDownload() {
  const fetchCatalog = useServerFn(getEmailTemplateCatalog);
  const [busy, setBusy] = useState<"json" | "csv" | "md" | null>(null);

  const download = async (format: "json" | "csv" | "md") => {
    setBusy(format);
    try {
      const doc = await fetchCatalog();
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "json") {
        downloadTextFile(
          `email-templates-catalog-${stamp}.json`,
          JSON.stringify(
            {
              generatedAt: doc.generatedAt,
              site: doc.site,
              systemDependencies: doc.systemDependencies,
              templates: doc.templates,
            },
            null,
            2,
          ),
          "application/json",
        );
      } else if (format === "csv") {
        const csvBody = [
          `# System dependencies`,
          ...doc.systemDependencies.map((d) => `# ${d}`),
          "",
          doc.csv,
        ].join("\n");
        downloadTextFile(`email-templates-catalog-${stamp}.csv`, csvBody, "text/csv");
      } else {
        downloadTextFile(`email-templates-catalog-${stamp}.md`, doc.markdown, "text/markdown");
      }
      toast.success(`Downloaded ${format.toUpperCase()} catalog`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Could not build catalog");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" /> Template catalog
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Download a list of every template with display name, trigger, recipient, merge fields,
          source file, code paths, and system dependencies (Resend, auth webhook, admin inboxes,
          etc.).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => void download("json")}
        >
          {busy === "json" ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <FileJson className="h-4 w-4 mr-1" />
          )}
          JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => void download("csv")}
        >
          {busy === "csv" ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-1" />
          )}
          CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => void download("md")}
        >
          {busy === "md" ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-1" />
          )}
          Markdown
        </Button>
      </div>
    </Card>
  );
}

function EmailTemplatesAdminPage() {
  const { user } = useApp();
  const isAdmin = userHasAdminRole(user);
  const list = useServerFn(listEmailTemplates);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "email-templates"],
    queryFn: () => list(),
    enabled: isAdmin,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<"all" | "transactional" | "auth">("all");

  const transactional = useMemo(
    () => (data ?? []).filter((t) => t.kind === "transactional"),
    [data],
  );
  const auth = useMemo(() => (data ?? []).filter((t) => t.kind === "auth"), [data]);
  const filtered = useMemo(() => {
    if (kindFilter === "transactional") return transactional;
    if (kindFilter === "auth") return auth;
    return data ?? [];
  }, [data, kindFilter, transactional, auth]);

  useEffect(() => {
    if (!selected && filtered.length) setSelected(filtered[0].name);
  }, [filtered, selected]);

  useEffect(() => {
    if (selected && filtered.length && !filtered.some((t) => t.name === selected)) {
      setSelected(filtered[0]?.name ?? null);
    }
  }, [filtered, selected]);

  return (
    <AppShell
      title="Email templates"
      subtitle="Edit transactional and auth emails. Saved overrides apply immediately to new sends."
    >
      <div className="space-y-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to admin
            </Link>
          </Button>
        </div>

        {!isAdmin ? (
          <Card className="p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Admin access is required to view and edit email templates.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Return to admin dashboard</Link>
            </Button>
          </Card>
        ) : (
          <>
        <p className="text-sm text-muted-foreground">
          Every template includes Get Part B Optimizer header logo. Auth templates use merge
          fields like <code className="rounded bg-muted px-1">{"{{confirmationUrl}}"}</code>;
          transactional templates use scenario and user data from each trigger.
        </p>

        <EmailTemplateCatalogDownload />

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
          </div>
        ) : isError ? (
          <Card className="p-6 text-center space-y-3">
            <p className="text-sm text-destructive">
              {(error as Error)?.message ?? "Could not load email templates."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Return to admin dashboard</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-[320px_1fr] gap-4">
            <Card className="p-2 max-h-[70vh] overflow-y-auto">
              <div className="px-2 pt-1 pb-2 space-y-2 border-b border-border mb-2">
                <div className="text-xs text-muted-foreground">
                  {transactional.length} transactional · {auth.length} auth
                </div>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      ["all", `All (${(data ?? []).length})`],
                      ["transactional", `Transactional (${transactional.length})`],
                      ["auth", `Auth (${auth.length})`],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={kindFilter === value ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setKindFilter(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <TemplateSidebarSection
                title="Transactional"
                templates={kindFilter === "auth" ? [] : transactional}
                selected={selected}
                onSelect={setSelected}
                hidden={kindFilter === "auth"}
              />
              <TemplateSidebarSection
                title="Auth"
                templates={kindFilter === "transactional" ? [] : auth}
                selected={selected}
                onSelect={setSelected}
                hidden={kindFilter === "transactional"}
              />
              {kindFilter === "all" && filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No templates found.</p>
              )}
            </Card>

            <div>{selected ? <TemplateEditor name={selected} /> : null}</div>
          </div>
        )}

        <EmailDeliveryBanner />

        <EmailSendLogPanel templateName={selected} />
        <EmailTemplateChangesPanel />
          </>
        )}
      </div>
    </AppShell>
  );
}

type TemplateListItem = {
  name: string;
  kind: string;
  displayName: string;
  overridden?: boolean;
};

function TemplateSidebarSection({
  title,
  templates,
  selected,
  onSelect,
  hidden,
}: {
  title: string;
  templates: TemplateListItem[];
  selected: string | null;
  onSelect: (name: string) => void;
  hidden?: boolean;
}) {
  if (hidden || templates.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="space-y-1">
        {templates.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onSelect(t.name)}
            className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
              selected === t.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{t.displayName}</span>
              {t.overridden && (
                <Badge variant="secondary" className="text-[10px]">
                  Custom
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateEditor({ name }: { name: string }) {
  const qc = useQueryClient();
  const fetchTpl = useServerFn(getEmailTemplate);
  const saveTpl = useServerFn(saveEmailTemplateOverride);
  const deleteTpl = useServerFn(deleteEmailTemplateOverride);
  const sendTest = useServerFn(sendEmailTemplateTest);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "email-template", name],
    queryFn: () => fetchTpl({ data: { name } }),
  });

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Reload key forces the iframe to re-mount with fresh srcDoc when we want
  // to discard in-place edits (e.g. after Reset or Restore from history).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!data) return;
    setSubject(data.override?.subject ?? data.defaultSubject);
    setHtml(data.override?.html ?? data.defaultHtml);
    setReloadKey((k) => k + 1);
  }, [data]);

  const isDirty = useMemo(() => {
    if (!data) return false;
    const baseSubject = data.override?.subject ?? data.defaultSubject;
    const baseHtml = data.override?.html ?? data.defaultHtml;
    return subject !== baseSubject || html !== baseHtml;
  }, [data, subject, html]);

  const save = useMutation({
    mutationFn: () => saveTpl({ data: { name, subject, html } }),
    onSuccess: () => {
      toast.success("Template saved. New sends will use this version.");
      qc.invalidateQueries({ queryKey: ["admin", "email-templates"] });
      qc.invalidateQueries({ queryKey: ["admin", "email-template", name] });
      qc.invalidateQueries({ queryKey: ["admin", "email-template-versions", name] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const reset = useMutation({
    mutationFn: () => deleteTpl({ data: { name } }),
    onSuccess: () => {
      toast.success("Reverted to the built-in template.");
      qc.invalidateQueries({ queryKey: ["admin", "email-templates"] });
      qc.invalidateQueries({ queryKey: ["admin", "email-template", name] });
      qc.invalidateQueries({ queryKey: ["admin", "email-template-versions", name] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Reset failed"),
  });

  const [testRecipient, setTestRecipient] = useState("");
  const test = useMutation({
    mutationFn: () => sendTest({ data: { name, recipient: testRecipient, subject, html } }),
    onSuccess: () => {
      toast.success(`Test email queued to ${testRecipient}.`);
      qc.invalidateQueries({ queryKey: ["admin", "email-send-log"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not send test"),
  });

  // Receive HTML edits posted from the iframe's editable document.
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const d = ev.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "tpl-edit" && d.name === name && typeof d.html === "string") {
        setHtml(d.html);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [name]);

  // Build the document we hand to the iframe: original HTML + injected script
  // that makes the body contentEditable and posts changes back to us.
  const editableSrcDoc = useMemo(() => {
    const baseHtml = data?.override?.html ?? data?.defaultHtml ?? "";
    const injected = `
<style>
  html,body{margin:0;padding:0;}
  body{outline:none;min-height:100%;cursor:text;}
  body:focus{outline:none;}
  ::selection{background:#b3cce8;}
</style>
<script>
(function(){
  var TPL = ${JSON.stringify(name)};
  function post(){
    try {
      var html = '<!doctype html>' + document.documentElement.outerHTML;
      parent.postMessage({type:'tpl-edit', name: TPL, html: html}, '*');
    } catch (e) {}
  }
  function ready(){
    // designMode makes the WHOLE document editable (more reliable than
    // contenteditable on body for email HTML that sets its own body attrs).
    try { document.designMode = 'on'; } catch (e) {}
    document.body.setAttribute('spellcheck','true');
    document.addEventListener('input', post, true);
    document.addEventListener('keyup', post, true);
    document.addEventListener('blur', post, true);
    // Stop link navigation inside the editor.
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest && e.target.closest('a');
      if (a) { e.preventDefault(); }
    }, true);
    // Toolbar commands from parent.
    window.addEventListener('message', function(ev){
      var d = ev.data;
      if (!d || d.type !== 'tpl-cmd') return;
      try {
        document.body.focus();
        if (d.command === 'createLink') {
          var url = d.value;
          if (url) document.execCommand('createLink', false, url);
        } else if (d.command === 'formatBlock') {
          document.execCommand('formatBlock', false, d.value);
        } else {
          document.execCommand(d.command, false, d.value || null);
        }
        post();
      } catch (e) {}
    });
    post();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
</script>`;
    // Inject before </body> if present, otherwise append.
    if (/<\/body>/i.test(baseHtml)) {
      return baseHtml.replace(/<\/body>/i, injected + "</body>");
    }
    return baseHtml + injected;
    // Only rebuild when the underlying template changes — NOT on every keystroke,
    // so the iframe is not constantly re-rendered while the admin is typing.
  }, [data?.override?.html, data?.defaultHtml, name, reloadKey]);

  function sendCommand(command: string, value?: string) {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "tpl-cmd", command, value }, "*");
  }

  if (isLoading || !data) {
    return (
      <Card className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{data.displayName}</h2>
            <p className="text-sm text-muted-foreground">{data.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Trigger:</span> {data.trigger}
            </p>
          </div>
          <Badge variant={data.kind === "auth" ? "destructive" : "secondary"}>{data.kind}</Badge>
        </div>
        {data.kind === "auth" && (
          <p className="text-xs text-amber-600 mt-2">
            Auth emails use merge fields such as{" "}
            <code className="rounded bg-muted px-1">{"{{confirmationUrl}}"}</code>,{" "}
            <code className="rounded bg-muted px-1">{"{{token}}"}</code>, and{" "}
            <code className="rounded bg-muted px-1">{"{{email}}"}</code>. They do not use name
            greetings like &quot;Hi Jane&quot; — use the built-in headings (Confirm your email,
            Reset your password, etc.).
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          The header logo is included automatically on every template (built-in and saved
          overrides). Do not remove the logo image at the top — it will be re-added on save if
          missing.
        </p>
        {data.mergeFields?.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Merge fields (use in subject or body):{" "}
            {data.mergeFields.map((field) => (
              <code key={field} className="mx-0.5 rounded bg-muted px-1">{`{{${field}}}`}</code>
            ))}
            . Sample preview values like Jane Doe are replaced automatically on send.
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Subject line</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={500} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email body</label>
          <p className="text-xs text-muted-foreground">
            Click anywhere in the preview to edit text directly. Formatting and links are preserved.
          </p>
          <EditorToolbar onCommand={sendCommand} />
          <iframe
            key={reloadKey}
            ref={iframeRef}
            title="Email editor"
            srcDoc={editableSrcDoc}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-[560px] rounded-b border border-border bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {data.override ? (
              <>
                Custom version active · last edited{" "}
                {new Date(data.override.updatedAt).toLocaleString()}
              </>
            ) : (
              <>Using built-in template.</>
            )}
          </div>
          <div className="flex gap-2">
            {data.override && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reset.mutate()}
                disabled={reset.isPending}
              >
                {reset.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-1" />
                )}
                Reset to default
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => save.mutate()}
              disabled={!isDirty || save.isPending}
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save changes
            </Button>
          </div>
        </div>
        <div className="border-t border-border pt-3 space-y-1">
          <label className="text-sm font-medium">Send test email</label>
          <p className="text-xs text-muted-foreground">
            Sends the current editor content (no need to save first) to the address below. Subject
            is prefixed with <code>[TEST]</code>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="flex-1 min-w-[220px]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => test.mutate()}
              disabled={!testRecipient.includes("@") || test.isPending}
            >
              {test.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send test
            </Button>
          </div>
        </div>
      </Card>

      <VersionHistory
        name={name}
        onRestore={(restoredSubject, restoredHtml) => {
          setSubject(restoredSubject);
          setHtml(restoredHtml);
          // Re-mount iframe so the editor reflects the restored HTML.
          // We mutate the cached template to drive the editable srcDoc memo.
          qc.setQueryData(["admin", "email-template", name], (prev: any) =>
            prev
              ? {
                  ...prev,
                  override: {
                    ...(prev.override ?? {}),
                    subject: restoredSubject,
                    html: restoredHtml,
                    updatedAt: prev.override?.updatedAt ?? new Date().toISOString(),
                  },
                }
              : prev,
          );
          setReloadKey((k) => k + 1);
          toast.info('Loaded version into editor. Click "Save changes" to publish.');
        }}
      />
    </div>
  );
}

function VersionHistory({
  name,
  onRestore,
}: {
  name: string;
  onRestore: (subject: string, html: string) => void;
}) {
  const listFn = useServerFn(listEmailTemplateVersions);
  const getFn = useServerFn(getEmailTemplateVersion);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "email-template-versions", name],
    queryFn: () => listFn({ data: { name } }),
  });

  const restore = useMutation({
    mutationFn: async (id: string) => getFn({ data: { id } }),
    onSuccess: (v) => onRestore(v.subject, v.html),
    onError: (e: any) => toast.error(e?.message ?? "Could not load version"),
  });

  return (
    <Card className="p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="versions" className="border-b-0">
          <AccordionTrigger className="py-0 hover:no-underline">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" /> Version history
              {!isLoading && data && data.length > 0 ? (
                <Badge variant="secondary" className="font-normal">
                  {data.length}
                </Badge>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Every save snapshots the previous version. Restore any earlier version into the
              editor, then save to publish it.
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading versions…
              </div>
            ) : !data || data.length === 0 ? (
              <div className="text-xs text-muted-foreground">No previous versions yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {data.map((v) => (
                  <li key={v.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{v.subject}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()} ·{" "}
                        <span className="uppercase">{v.source}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restore.mutate(v.id)}
                      disabled={restore.isPending}
                    >
                      {restore.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-1" />
                      )}
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function EditorToolbar({ onCommand }: { onCommand: (command: string, value?: string) => void }) {
  const btn =
    "inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted text-foreground/80 hover:text-foreground transition-colors";
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t border border-b-0 border-border bg-muted/30 px-2 py-1">
      <button type="button" className={btn} title="Bold" onClick={() => onCommand("bold")}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Italic" onClick={() => onCommand("italic")}>
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        title="Underline"
        onClick={() => onCommand("underline")}
      >
        <Underline className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn}
        title="Heading 1"
        onClick={() => onCommand("formatBlock", "H1")}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        title="Heading 2"
        onClick={() => onCommand("formatBlock", "H2")}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        title="Paragraph"
        onClick={() => onCommand("formatBlock", "P")}
      >
        <Pilcrow className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn}
        title="Bulleted list"
        onClick={() => onCommand("insertUnorderedList")}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        title="Numbered list"
        onClick={() => onCommand("insertOrderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn}
        title="Insert link"
        onClick={() => {
          const url = window.prompt("Link URL", "https://");
          if (url) onCommand("createLink", url);
        }}
      >
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Remove link" onClick={() => onCommand("unlink")}>
        <Link2 className="h-4 w-4 opacity-50" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn} title="Undo" onClick={() => onCommand("undo")}>
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Redo" onClick={() => onCommand("redo")}>
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "sent":
      return "default";
    case "failed":
    case "dlq":
    case "bounced":
    case "complained":
      return "destructive";
    case "suppressed":
      return "outline";
    default:
      return "secondary";
  }
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
}: {
  label: string;
  sortKey: EmailLogSortKey;
  currentKey: EmailLogSortKey;
  currentDir: SortDir;
  onClick: (key: EmailLogSortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className="py-2 pr-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onClick(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active &&
          (currentDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          ))}
      </span>
    </th>
  );
}

function EmailDeliveryBanner() {
  const fetchStatus = useServerFn(getEmailDeliveryStatus);
  const { data } = useQuery({
    queryKey: ["admin", "email-delivery-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
  });

  if (!data || data.ready) return null;

  const keyMissing = data.message.includes("not configured") || data.message.includes("invalid");

  return (
    <Card className="p-4 border-amber-500/40 bg-amber-500/5 space-y-1">
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
        {keyMissing
          ? "Email delivery unavailable — Resend API key"
          : "Email delivery limited — domain not verified"}
      </p>
      <p className="text-sm text-muted-foreground">{data.message}</p>
      <p className="text-xs text-muted-foreground">
        From address: <span className="font-mono">{data.fromAddress}</span>
        {" · "}
        Resend status: <span className="font-mono">{data.domainStatus}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Run <span className="font-mono">node scripts/show-resend-dns-setup.mjs</span> for DNS
        records, add them in Cloudflare, then verify at{" "}
        <a href="https://resend.com/domains" className="underline" target="_blank" rel="noreferrer">
          resend.com/domains
        </a>
        .
      </p>
    </Card>
  );
}

function EmailSendLogPanel({ templateName }: { templateName: string | null }) {
  const listLog = useServerFn(listEmailSendLog);
  const [showAll, setShowAll] = useState(false);
  const filterTemplate = showAll ? undefined : (templateName ?? undefined);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "email-send-log", showAll ? "all" : (templateName ?? "none")],
    queryFn: () =>
      listLog({
        data: {
          limit: 50,
          ...(filterTemplate ? { templateName: filterTemplate } : {}),
        },
      }),
    refetchInterval: 15_000,
    enabled: showAll || Boolean(templateName),
  });
  const [sortKey, setSortKey] = useState<EmailLogSortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedData = useMemo(() => {
    if (!data) return [];
    return sortEmailLog(data as EmailLogRow[], sortKey, sortDir);
  }, [data, sortKey, sortDir]);

  function toggleSort(key: EmailLogSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Inbox className="h-4 w-4" /> Recent email sends
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-all-email-log"
              checked={showAll}
              onCheckedChange={(checked) => setShowAll(checked === true)}
            />
            <label
              htmlFor="show-all-email-log"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Show all templates
            </label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {showAll
          ? "Latest 50 emails across all templates (auto-refreshes every 15 seconds)."
          : templateName
            ? `Emails sent for the "${templateName}" template only. Check "Show all templates" to view every send.`
            : "Select a template to view its send log."}
      </p>
      {!showAll && !templateName ? (
        <div className="text-xs text-muted-foreground">Select a template above.</div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      ) : !sortedData || sortedData.length === 0 ? (
        <div className="text-xs text-muted-foreground">
          {showAll ? "No emails sent yet." : "No sends recorded for this template yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <SortHeader
                  label="When"
                  sortKey="created_at"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={toggleSort}
                />
                {showAll ? (
                  <SortHeader
                    label="Template"
                    sortKey="template_name"
                    currentKey={sortKey}
                    currentDir={sortDir}
                    onClick={toggleSort}
                  />
                ) : null}
                <SortHeader
                  label="Sent to"
                  sortKey="recipient_email"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={toggleSort}
                />
                <SortHeader
                  label="Status"
                  sortKey="status"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={toggleSort}
                />
                <SortHeader
                  label="Error"
                  sortKey="error_message"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onClick={toggleSort}
                />
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  {showAll ? <td className="py-2 pr-3">{row.template_name}</td> : null}
                  <td className="py-2 pr-3 break-all">
                    {row.recipient_name && row.recipient_name !== row.recipient_email ? (
                      <>
                        <span className="font-medium text-foreground">{row.recipient_name}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">{row.recipient_email}</span>
                      </>
                    ) : (
                      row.recipient_email
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge variant={statusBadgeVariant(row.status)} className="capitalize">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-xs text-destructive break-all">
                    {row.error_message ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function EmailTemplateChangesPanel() {
  const listChanges = useServerFn(listEmailTemplateChanges);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "email-template-changes"],
    queryFn: () => listChanges({ data: { limit: 50 } }),
    refetchInterval: 30_000,
  });

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Inbox className="h-4 w-4" /> Template change log
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Saves and resets to email templates. Each entry records who changed which template and when.
      </p>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-xs text-muted-foreground">No template changes yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Template</th>
                <th className="py-2 pr-3 font-medium">Action</th>
                <th className="py-2 font-medium">User</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 break-all">{row.entity_id ?? ""}</td>
                  <td className="py-2 pr-3">
                    <Badge
                      variant={
                        row.action === "DELETE_EMAIL_TEMPLATE_OVERRIDE" ? "destructive" : "default"
                      }
                    >
                      {row.action === "SAVE_EMAIL_TEMPLATE_OVERRIDE" ? "Saved" : "Reset"}
                    </Badge>
                  </td>
                  <td className="py-2 text-xs break-all text-muted-foreground">
                    {row.user_id ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
