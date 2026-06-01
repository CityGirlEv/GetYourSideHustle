import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Mail, RotateCcw, Save, Eye } from 'lucide-react'
import {
  listEmailTemplates,
  getEmailTemplate,
  saveEmailTemplateOverride,
  deleteEmailTemplateOverride,
} from '@/lib/email-template-admin.functions'

export const Route = createFileRoute('/admin/email-templates')({
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
  const [previewOpen, setPreviewOpen] = useState(true)

  useEffect(() => {
    if (!data) return
    setSubject(data.override?.subject ?? data.defaultSubject)
    setHtml(data.override?.html ?? data.defaultHtml)
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
    },
    onError: (e: any) => toast.error(e?.message ?? 'Reset failed'),
  })

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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HTML body</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen((v) => !v)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {previewOpen ? 'Hide preview' : 'Show preview'}
            </Button>
          </div>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={18}
            className="font-mono text-xs"
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

      {previewOpen && (
        <Card className="p-4 space-y-2">
          <div className="text-sm font-medium">Preview</div>
          <div className="text-xs text-muted-foreground">
            Rendered with sample data — actual sends substitute real recipient values.
          </div>
          <iframe
            title="Email preview"
            srcDoc={html}
            sandbox=""
            className="w-full h-[480px] rounded border border-border bg-white"
          />
        </Card>
      )}
    </div>
  )
}
