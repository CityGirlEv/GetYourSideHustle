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
import { ArrowLeft, Loader2, Mail, RotateCcw, Save, History } from 'lucide-react'
import {
  listEmailTemplates,
  getEmailTemplate,
  saveEmailTemplateOverride,
  deleteEmailTemplateOverride,
  listEmailTemplateVersions,
  getEmailTemplateVersion,
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
      </div>
    </AppShell>
  )
}

function TemplateEditor({ name }: { name: string }) {
  const qc = useQueryClient()
  const fetchTpl = useServerFn(getEmailTemplate)
  const saveTpl = useServerFn(saveEmailTemplateOverride)
  const deleteTpl = useServerFn(deleteEmailTemplateOverride)

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
<style>html,body{margin:0;padding:0;}body{outline:none;}[contenteditable=true]:focus{outline:2px solid #6366f1;outline-offset:-2px;border-radius:2px;}</style>
<script>
(function(){
  function ready(){
    document.body.setAttribute('contenteditable','true');
    document.body.setAttribute('spellcheck','true');
    var post = function(){
      var html = '<!doctype html>' + document.documentElement.outerHTML;
      parent.postMessage({type:'tpl-edit', name: ${JSON.stringify(name)}, html: html}, '*');
    };
    document.addEventListener('input', post, true);
    document.addEventListener('blur', post, true);
    // Prevent navigation when admin clicks a link inside the editor.
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest && e.target.closest('a');
      if (a) { e.preventDefault(); }
    }, true);
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
          <iframe
            key={reloadKey}
            ref={iframeRef}
            title="Email editor"
            srcDoc={editableSrcDoc}
            sandbox="allow-scripts"
            className="w-full h-[560px] rounded border border-border bg-white"
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
