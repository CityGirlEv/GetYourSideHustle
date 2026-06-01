import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Loader2,
  Mail,
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
} from 'lucide-react'
import {
  listEmailTemplates,
  getEmailTemplate,
  saveEmailTemplateOverride,
  deleteEmailTemplateOverride,
  listEmailTemplateVersions,
  getEmailTemplateVersion,
  sendEmailTemplateTest,
  listEmailSendLog,
  listEmailTemplateChanges,
} from '@/lib/email-template-admin.functions'

export const Route = createFileRoute('/admin_/email-templates')({
  head: () => ({
    meta: [
      { title: 'Email Templates — Admin' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: EmailTemplatesAdminPage,
})

function EmailTemplatesAdminPage() {
  const list = useServerFn(listEmailTemplates)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'email-templates'],
    queryFn: () => list(),
  })
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!selected && data && data.length) setSelected(data[0].name)
  }, [data, selected])

  return (
    <AppShell title="Email templates" subtitle="Edit any system email">
      <div className="container mx-auto max-w-6xl py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin"><ArrowLeft className="h-4 w-4 mr-1" />Back to admin</Link>
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" /> Email templates
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit the subject line and HTML body for any email the system sends. Saved
          overrides are used immediately for new sends. Reset an override to fall
          back to the built-in template.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
          </div>
        ) : (
          <div className="grid md:grid-cols-[320px_1fr] gap-4">
            <Card className="p-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                {(data ?? []).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelected(t.name)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                      selected === t.name
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
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
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="uppercase">{t.kind}</span>
                      <span>·</span>
                      <span className="truncate">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div>{selected ? <TemplateEditor name={selected} /> : null}</div>
          </div>
        )}

        <EmailSendLogPanel />
        <EmailTemplateChangesPanel />
      </div>
    </AppShell>
  )
}

function TemplateEditor({ name }: { name: string }) {
  const qc = useQueryClient()
  const fetchTpl = useServerFn(getEmailTemplate)
  const saveTpl = useServerFn(saveEmailTemplateOverride)
  const deleteTpl = useServerFn(deleteEmailTemplateOverride)
  const sendTest = useServerFn(sendEmailTemplateTest)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'email-template', name],
    queryFn: () => fetchTpl({ data: { name } }),
  })

  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  // Reload key forces the iframe to re-mount with fresh srcDoc when we want
  // to discard in-place edits (e.g. after Reset or Restore from history).
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!data) return
    setSubject(data.override?.subject ?? data.defaultSubject)
    setHtml(data.override?.html ?? data.defaultHtml)
    setReloadKey((k) => k + 1)
  }, [data])

  const isDirty = useMemo(() => {
    if (!data) return false
    const baseSubject = data.override?.subject ?? data.defaultSubject
    const baseHtml = data.override?.html ?? data.defaultHtml
    return subject !== baseSubject || html !== baseHtml
  }, [data, subject, html])

  const save = useMutation({
    mutationFn: () => saveTpl({ data: { name, subject, html } }),
    onSuccess: () => {
      toast.success('Template saved. New sends will use this version.')
      qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] })
      qc.invalidateQueries({ queryKey: ['admin', 'email-template', name] })
      qc.invalidateQueries({ queryKey: ['admin', 'email-template-versions', name] })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Save failed'),
  })

  const reset = useMutation({
    mutationFn: () => deleteTpl({ data: { name } }),
    onSuccess: () => {
      toast.success('Reverted to the built-in template.')
      qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] })
      qc.invalidateQueries({ queryKey: ['admin', 'email-template', name] })
      qc.invalidateQueries({ queryKey: ['admin', 'email-template-versions', name] })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Reset failed'),
  })

  const [testRecipient, setTestRecipient] = useState('')
  const test = useMutation({
    mutationFn: () =>
      sendTest({ data: { name, recipient: testRecipient, subject, html } }),
    onSuccess: () => toast.success(`Test email queued to ${testRecipient}.`),
    onError: (e: any) => toast.error(e?.message ?? 'Could not send test'),
  })

  // Receive HTML edits posted from the iframe's editable document.
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const d = ev.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'tpl-edit' && d.name === name && typeof d.html === 'string') {
        setHtml(d.html)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [name])

  // Build the document we hand to the iframe: original HTML + injected script
  // that makes the body contentEditable and posts changes back to us.
  const editableSrcDoc = useMemo(() => {
    const baseHtml = data?.override?.html ?? data?.defaultHtml ?? ''
    const injected = `
<style>
  html,body{margin:0;padding:0;}
  body{outline:none;min-height:100%;cursor:text;}
  body:focus{outline:none;}
  ::selection{background:#c7d2fe;}
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
</script>`
    // Inject before </body> if present, otherwise append.
    if (/<\/body>/i.test(baseHtml)) {
      return baseHtml.replace(/<\/body>/i, injected + '</body>')
    }
    return baseHtml + injected
    // Only rebuild when the underlying template changes — NOT on every keystroke,
    // so the iframe is not constantly re-rendered while the admin is typing.
  }, [data?.override?.html, data?.defaultHtml, name, reloadKey])

  function sendCommand(command: string, value?: string) {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage({ type: 'tpl-cmd', command, value }, '*')
  }

  if (isLoading || !data) {
    return (
      <Card className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </Card>
    )
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
          <Badge variant={data.kind === 'auth' ? 'destructive' : 'secondary'}>
            {data.kind}
          </Badge>
        </div>
        {data.kind === 'auth' && (
          <p className="text-xs text-amber-600 mt-2">
            Auth emails carry dynamic links and codes (confirmation URL, token,
            email). Keep the original placeholders in the HTML — they are
            populated at send time and cannot be hard-coded.
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
            Click anywhere in the preview to edit text directly. Formatting and
            links are preserved.
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
              <>Custom version active · last edited {new Date(data.override.updatedAt).toLocaleString()}</>
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
                {reset.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                Reset to default
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => save.mutate()}
              disabled={!isDirty || save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save changes
            </Button>
          </div>
        </div>
        <div className="border-t border-border pt-3 space-y-1">
          <label className="text-sm font-medium">Send test email</label>
          <p className="text-xs text-muted-foreground">
            Sends the current editor content (no need to save first) to the
            address below. Subject is prefixed with <code>[TEST]</code>.
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
              disabled={!testRecipient.includes('@') || test.isPending}
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
          setSubject(restoredSubject)
          setHtml(restoredHtml)
          // Re-mount iframe so the editor reflects the restored HTML.
          // We mutate the cached template to drive the editable srcDoc memo.
          qc.setQueryData(['admin', 'email-template', name], (prev: any) =>
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
          )
          setReloadKey((k) => k + 1)
          toast.info('Loaded version into editor. Click "Save changes" to publish.')
        }}
      />
    </div>
  )
}

function VersionHistory({
  name,
  onRestore,
}: {
  name: string
  onRestore: (subject: string, html: string) => void
}) {
  const listFn = useServerFn(listEmailTemplateVersions)
  const getFn = useServerFn(getEmailTemplateVersion)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'email-template-versions', name],
    queryFn: () => listFn({ data: { name } }),
  })

  const restore = useMutation({
    mutationFn: async (id: string) => getFn({ data: { id } }),
    onSuccess: (v) => onRestore(v.subject, v.html),
    onError: (e: any) => toast.error(e?.message ?? 'Could not load version'),
  })

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <History className="h-4 w-4" /> Version history
      </div>
      <p className="text-xs text-muted-foreground">
        Every save snapshots the previous version. Restore any earlier version
        into the editor, then save to publish it.
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
                  {new Date(v.created_at).toLocaleString()} ·{' '}
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
    </Card>
  )
}

function EditorToolbar({
  onCommand,
}: {
  onCommand: (command: string, value?: string) => void
}) {
  const btn =
    'inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted text-foreground/80 hover:text-foreground transition-colors'
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t border border-b-0 border-border bg-muted/30 px-2 py-1">
      <button type="button" className={btn} title="Bold" onClick={() => onCommand('bold')}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Italic" onClick={() => onCommand('italic')}>
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Underline" onClick={() => onCommand('underline')}>
        <Underline className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn} title="Heading 1" onClick={() => onCommand('formatBlock', 'H1')}>
        <Heading1 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Heading 2" onClick={() => onCommand('formatBlock', 'H2')}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Paragraph" onClick={() => onCommand('formatBlock', 'P')}>
        <Pilcrow className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn} title="Bulleted list" onClick={() => onCommand('insertUnorderedList')}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Numbered list" onClick={() => onCommand('insertOrderedList')}>
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn}
        title="Insert link"
        onClick={() => {
          const url = window.prompt('Link URL', 'https://')
          if (url) onCommand('createLink', url)
        }}
      >
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Remove link" onClick={() => onCommand('unlink')}>
        <Link2 className="h-4 w-4 opacity-50" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn} title="Undo" onClick={() => onCommand('undo')}>
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn} title="Redo" onClick={() => onCommand('redo')}>
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'sent':
      return 'default'
    case 'failed':
    case 'dlq':
    case 'bounced':
    case 'complained':
      return 'destructive'
    case 'suppressed':
      return 'outline'
    default:
      return 'secondary'
  }
}

export type EmailLogSortKey = 'created_at' | 'template_name' | 'recipient_email' | 'status' | 'error_message'
export type SortDir = 'asc' | 'desc'

export interface EmailLogRow {
  id: string
  message_id: string | null
  template_name: string
  recipient_email: string
  status: string
  error_message: string | null
  created_at: string
}

export function sortEmailLog(rows: EmailLogRow[], key: EmailLogSortKey, dir: SortDir): EmailLogRow[] {
  const cmp = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    if (key === 'created_at') {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return (da - db) * cmp
    }
    const av = (a[key] ?? '').toString().toLowerCase()
    const bv = (b[key] ?? '').toString().toLowerCase()
    if (av < bv) return -1 * cmp
    if (av > bv) return 1 * cmp
    return 0
  })
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
}: {
  label: string
  sortKey: EmailLogSortKey
  currentKey: EmailLogSortKey
  currentDir: SortDir
  onClick: (key: EmailLogSortKey) => void
}) {
  const active = currentKey === sortKey
  return (
    <th
      className="py-2 pr-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onClick(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          currentDir === 'asc'
            ? <ArrowUp className="h-3 w-3" />
            : <ArrowDown className="h-3 w-3" />
        )}
      </span>
    </th>
  )
}

function EmailSendLogPanel() {
  const listLog = useServerFn(listEmailSendLog)
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'email-send-log'],
    queryFn: () => listLog({ data: { limit: 50 } }),
    refetchInterval: 15_000,
  })
  const [sortKey, setSortKey] = useState<EmailLogSortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sortedData = useMemo(() => {
    if (!data) return []
    return sortEmailLog(data as EmailLogRow[], sortKey, sortDir)
  }, [data, sortKey, sortDir])

  function toggleSort(key: EmailLogSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Inbox className="h-4 w-4" /> Recent email sends
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
        Latest 50 emails the system has tried to send. Each row shows the most
        recent status for that message (auto-refreshes every 15 seconds).
      </p>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      ) : !sortedData || sortedData.length === 0 ? (
        <div className="text-xs text-muted-foreground">No emails sent yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <SortHeader label="When" sortKey="created_at" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} />
                <SortHeader label="Template" sortKey="template_name" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} />
                <SortHeader label="Recipient" sortKey="recipient_email" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} />
                <SortHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} />
                <SortHeader label="Error" sortKey="error_message" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">{row.template_name}</td>
                  <td className="py-2 pr-3 break-all">{row.recipient_email}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={statusBadgeVariant(row.status)} className="capitalize">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-xs text-destructive break-all">
                    {row.error_message ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function EmailTemplateChangesPanel() {
  const listChanges = useServerFn(listEmailTemplateChanges)
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'email-template-changes'],
    queryFn: () => listChanges({ data: { limit: 50 } }),
    refetchInterval: 30_000,
  })

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
        Saves and resets to email templates. Each entry records who changed
        which template and when.
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
                  <td className="py-2 pr-3 break-all">{row.entity_id ?? ''}</td>
                  <td className="py-2 pr-3">
                    <Badge
                      variant={
                        row.action === 'DELETE_EMAIL_TEMPLATE_OVERRIDE'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {row.action === 'SAVE_EMAIL_TEMPLATE_OVERRIDE' ? 'Saved' : 'Reset'}
                    </Badge>
                  </td>
                  <td className="py-2 text-xs break-all text-muted-foreground">
                    {row.user_id ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
