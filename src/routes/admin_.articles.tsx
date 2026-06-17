import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Download,
  ImagePlus,
  Loader2,
  Save,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  buildFeaturedImagePrompt,
  dataUrlToBlob,
  downloadBlobFile,
  downloadTextFile,
  featuredImagePublicPath,
  fileExtensionFromName,
  serializeArticleMarkdown,
  slugifyArticleTitle,
  type ArticleDraft,
} from "@/lib/article-authoring";
import {
  getArticleAuthoringCapabilities,
  loadArticleTopicAdmin,
  researchMedicareComplaintsAdmin,
  resolveFeaturedImageAdmin,
  saveArticleFilesAdmin,
} from "@/lib/article-authoring.functions";
import { LEARNING_CENTER_CATEGORIES, type ArticleCategory } from "@/lib/learning-center";
import type { MedicareComplaintResearch } from "@/lib/medicare-complaint-topics";

export const Route = createFileRoute("/admin_/articles")({
  head: () => ({
    meta: [{ title: "Create Articles — Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminArticlesPage,
});

const EMPTY_DRAFT: ArticleDraft = {
  title: "",
  slug: "",
  excerpt: "",
  category: "plan-types",
  metaDescription: "",
  featuredImage: "",
  featured: false,
  published: true,
  sortOrder: 100,
  publishedAt: new Date().toISOString().slice(0, 10),
  bodyMd: "",
};

function AdminArticlesPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const fetchCapabilities = useServerFn(getArticleAuthoringCapabilities);
  const researchComplaints = useServerFn(researchMedicareComplaintsAdmin);
  const loadTopicDraft = useServerFn(loadArticleTopicAdmin);
  const resolveFeaturedImage = useServerFn(resolveFeaturedImageAdmin);
  const saveArticleFiles = useServerFn(saveArticleFilesAdmin);

  const [draft, setDraft] = useState<ArticleDraft>(EMPTY_DRAFT);
  const [complaintResearch, setComplaintResearch] = useState<MedicareComplaintResearch | null>(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [busyResearch, setBusyResearch] = useState(false);
  const [busyTopic, setBusyTopic] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"prompt-only" | "auto">("prompt-only");
  const [canWriteToDisk, setCanWriteToDisk] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [generatedImageDataUrl, setGeneratedImageDataUrl] = useState<string | null>(null);
  const [busyImage, setBusyImage] = useState(false);
  const [busySave, setBusySave] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !userHasAdminRole(user)) return;
    fetchCapabilities()
      .then((caps) => {
        setImageMode(caps.imageGeneration);
        setCanWriteToDisk(caps.canWriteToDisk);
      })
      .catch(() => {});
  }, [user, fetchCapabilities]);

  const localPrompt = useMemo(
    () =>
      draft.title.trim().length >= 8 && draft.excerpt.trim().length >= 20
        ? buildFeaturedImagePrompt(draft)
        : "",
    [draft],
  );

  const effectivePrompt = imagePrompt || localPrompt;

  const revokePreview = (url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => revokePreview(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const onUploadImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, or WEBP).");
      return;
    }
    setUploadedImageFile(file);
    setGeneratedImageDataUrl(null);
    revokePreview(imagePreviewUrl);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    const ext = fileExtensionFromName(file.name);
    setDraft((d) => ({
      ...d,
      featuredImage: d.slug ? featuredImagePublicPath(d.slug, ext) : "",
    }));
  };

  const handleFeaturedImageClick = async () => {
    if (draft.title.trim().length < 8 || draft.excerpt.trim().length < 20) {
      toast.error("Enter a title and excerpt first so we can build an image prompt.");
      return;
    }
    setBusyImage(true);
    try {
      const result = await resolveFeaturedImage({
        data: {
          title: draft.title,
          excerpt: draft.excerpt,
          category: draft.category,
        },
      });
      setImagePrompt(result.prompt);
      if (result.mode === "prompt") {
        toast.message("Prompt ready — auto-generation is off to save API credits.");
        return;
      }
      setGeneratedImageDataUrl(result.dataUrl);
      setUploadedImageFile(null);
      revokePreview(imagePreviewUrl);
      setImagePreviewUrl(result.dataUrl);
      setDraft((d) => ({
        ...d,
        featuredImage: d.slug ? featuredImagePublicPath(d.slug, "png") : "",
      }));
      toast.success("Featured image generated.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not resolve featured image");
    } finally {
      setBusyImage(false);
    }
  };

  const copyPrompt = async () => {
    const text = effectivePrompt;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("Image prompt copied");
  };

  const handleFindComplaints = async () => {
    setBusyResearch(true);
    try {
      const result = await researchComplaints();
      setComplaintResearch(result);
      setExpandedComplaintId(result.complaints[0]?.id ?? null);
      toast.success("Loaded top 10 Medicare complaint themes");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load complaint research");
    } finally {
      setBusyResearch(false);
    }
  };

  const handlePickTopic = async (topicId: string) => {
    setBusyTopic(topicId);
    try {
      const topicDraft = await loadTopicDraft({ data: { topicId } });
      setDraft(topicDraft);
      setSelectedTopicId(topicId);
      setImagePrompt(buildFeaturedImagePrompt(topicDraft));
      setImagePreviewUrl(null);
      setUploadedImageFile(null);
      setGeneratedImageDataUrl(null);
      toast.success("Draft loaded — review below, then add an image and save");
      document.getElementById("article-draft-form")?.scrollIntoView({ behavior: "smooth" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load topic draft");
    } finally {
      setBusyTopic(null);
    }
  };

  const buildFinalDraft = (): ArticleDraft => {
    const slug = draft.slug.trim() || slugifyArticleTitle(draft.title);
    const ext = uploadedImageFile
      ? fileExtensionFromName(uploadedImageFile.name)
      : generatedImageDataUrl
        ? "png"
        : "webp";
    return {
      ...draft,
      slug,
      featuredImage:
        uploadedImageFile || generatedImageDataUrl
          ? featuredImagePublicPath(slug, ext)
          : draft.featuredImage.trim() || undefined,
    };
  };

  const downloadArticleFiles = (finalDraft: ArticleDraft) => {
    downloadTextFile(`${finalDraft.slug}.md`, serializeArticleMarkdown(finalDraft));
    if (uploadedImageFile) {
      downloadBlobFile(
        `${finalDraft.slug}.${fileExtensionFromName(uploadedImageFile.name)}`,
        uploadedImageFile,
      );
    } else if (generatedImageDataUrl) {
      downloadBlobFile(`${finalDraft.slug}.png`, dataUrlToBlob(generatedImageDataUrl));
    }
  };

  const handleCreateArticle = async () => {
    const finalDraft = buildFinalDraft();
    if (!finalDraft.title.trim() || !finalDraft.slug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }
    if (finalDraft.metaDescription.trim().length < 40) {
      toast.error("Meta description should be at least 40 characters.");
      return;
    }
    if (finalDraft.bodyMd.trim().length < 80) {
      toast.error("Article body is too short.");
      return;
    }

    setBusySave(true);
    try {
      if (canWriteToDisk) {
        const imageBase64 =
          uploadedImageFile || generatedImageDataUrl
            ? await blobToBase64(uploadedImageFile ?? dataUrlToBlob(generatedImageDataUrl!))
            : undefined;
        const saved = await saveArticleFiles({
          data: {
            draft: finalDraft,
            imageBase64,
            imageMimeType: uploadedImageFile?.type ?? (generatedImageDataUrl ? "image/png" : undefined),
            imageExtension: uploadedImageFile
              ? fileExtensionFromName(uploadedImageFile.name)
              : generatedImageDataUrl
                ? "png"
                : undefined,
          },
        });
        toast.success(`Saved ${saved.markdownPath}${saved.imagePath ? ` and ${saved.imagePath}` : ""}`);
      } else {
        downloadArticleFiles(finalDraft);
        toast.success("Downloaded article file(s). Commit them to articles/ and public/learning-center/.");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not create article");
    } finally {
      setBusySave(false);
    }
  };

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  return (
    <AppShell
      title="Create Learning Center article"
      subtitle="File-based articles — upload or generate a featured image, then save or download."
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Admin-only · articles live in the repo <code className="text-xs">articles/</code> folder
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <Card className="glass p-4 sm:p-5 space-y-4 border-primary/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold">Start from real complaints</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Click below to load the 10 biggest Medicare complaint themes (from CMS/OIG reports and
                forum patterns). Pick a suggested topic — we fill in title, slug, SEO fields, and body.
              </p>
            </div>
            <Button type="button" onClick={handleFindComplaints} disabled={busyResearch}>
              {busyResearch ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Find top 10 complaints
            </Button>
          </div>

          {complaintResearch ? (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Researched {complaintResearch.researchedAt}. {complaintResearch.sourceNote}
              </p>
              <ol className="space-y-2">
                {complaintResearch.complaints.map((cluster) => {
                  const open = expandedComplaintId === cluster.id;
                  return (
                    <li
                      key={cluster.id}
                      className="rounded-lg border border-border bg-background/60 overflow-hidden"
                    >
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-muted/40 transition-colors"
                        onClick={() =>
                          setExpandedComplaintId(open ? null : cluster.id)
                        }
                      >
                        <span className="font-mono text-xs text-muted-foreground mt-0.5 w-5 shrink-0">
                          #{cluster.rank}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-sm">{cluster.complaint}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {cluster.whyItMatters}
                          </span>
                        </span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {cluster.topics.length} topics
                        </Badge>
                      </button>
                      {open ? (
                        <ul className="border-t border-border px-3 py-2 space-y-2 bg-muted/20">
                          {cluster.topics.map((topic) => (
                            <li key={topic.id}>
                              <button
                                type="button"
                                disabled={busyTopic === topic.id}
                                onClick={() => handlePickTopic(topic.id)}
                                className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${
                                  selectedTopicId === topic.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/40 hover:bg-background"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm font-medium text-primary">{topic.title}</span>
                                  {busyTopic === topic.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                  ) : null}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{topic.pitch}</p>
                              </button>
                            </li>
                          ))}
                          <p className="text-[10px] text-muted-foreground pt-1">Signal: {cluster.signal}</p>
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No research loaded yet. Use the button above — then pick a topic and we will draft the article
              for you.
            </p>
          )}
        </Card>

        <Card id="article-draft-form" className="glass p-4 sm:p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium">Title</label>
              <Input
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    title: e.target.value,
                    slug: d.slug || slugifyArticleTitle(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Slug</label>
              <Input
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sort order</label>
              <Input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Meta description ({draft.metaDescription.length}/160)
            </label>
            <Textarea
              rows={2}
              value={draft.metaDescription}
              onChange={(e) => setDraft((d) => ({ ...d, metaDescription: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Excerpt</label>
            <Textarea
              rows={2}
              value={draft.excerpt}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Category</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, category: e.target.value as ArticleCategory }))
                }
              >
                {LEARNING_CENTER_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Published date</label>
              <Input
                type="date"
                value={draft.publishedAt}
                onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.featured}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, featured: Boolean(v) }))}
              />
              Featured on Learning Center
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={draft.published}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, published: Boolean(v) }))}
              />
              Published
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Body (Markdown)</label>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Use ## headings for sections. Add a ## Frequently asked questions block with ### questions
              for the accordion — if omitted, a standard FAQ block is appended when you save.
            </p>
            <Textarea
              rows={12}
              className="font-mono text-xs"
              value={draft.bodyMd}
              onChange={(e) => setDraft((d) => ({ ...d, bodyMd: e.target.value }))}
            />
          </div>
        </Card>

        <Card className="glass p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Featured image</h2>
            <Badge variant="outline">
              {imageMode === "auto" ? "Auto-generate enabled" : "Prompt-only (saves credits)"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-accent">
              <ImagePlus className="h-4 w-4" />
              Upload image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => onUploadImage(e.target.files?.[0] ?? null)}
              />
            </label>
            <Button type="button" size="sm" onClick={handleFeaturedImageClick} disabled={busyImage}>
              {busyImage ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {imageMode === "auto" ? "Generate featured image" : "Show image prompt"}
            </Button>
            {effectivePrompt ? (
              <Button type="button" size="sm" variant="ghost" onClick={copyPrompt}>
                <Copy className="h-4 w-4 mr-1" /> Copy prompt
              </Button>
            ) : null}
          </div>

          {imageMode === "prompt-only" ? (
            <p className="text-xs text-muted-foreground">
              Auto image generation is off by default to avoid API credits. Use the button above for
              a copy-ready prompt, or upload your own image.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Auto generation uses OpenAI when configured. You can still upload an image instead.
            </p>
          )}

          {effectivePrompt ? (
            <Textarea
              rows={4}
              readOnly
              className="text-xs font-mono bg-muted/30"
              value={effectivePrompt}
            />
          ) : null}

          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt=""
              className="w-full max-h-56 object-cover rounded-lg border border-border"
            />
          ) : null}

          {draft.featuredImage ? (
            <p className="text-xs text-muted-foreground">
              Frontmatter path: <code>{draft.featuredImage}</code>
            </p>
          ) : null}
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateArticle} disabled={busySave} className="grad-indigo">
            {busySave ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : canWriteToDisk ? (
              <Save className="h-4 w-4 mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {canWriteToDisk ? "Create article files" : "Download article files"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
