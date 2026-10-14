import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  BookMarked,
  Check,
  FileType2,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadMaterial, fetchMaterials, purchaseMaterial } from "@/lib/portal-data";
import {
  MATERIAL_CATEGORIES,
  MATERIAL_LEVELS,
  type ExamMaterial,
} from "@/lib/portal-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/exam-materials")({
  head: () => ({
    meta: [
      { title: "Exam materials | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Past papers, revision notes, question banks and model answers prepared by subject specialists. Pay once and download instantly.",
      },
      { property: "og:title", content: "Exam materials | ScholarDesk" },
      {
        property: "og:description",
        content: "Curated revision packs you can filter by subject, level and format.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
     { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: ExamMaterials,
});

type SortKey = "popular" | "newest" | "price_low" | "rating";

function ExamMaterials() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [level, setLevel] = useState("All levels");
  const [category, setCategory] = useState("All types");
  const [sort, setSort] = useState<SortKey>("popular");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTerm(term.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [term]);

  const filters = {
    ...(debouncedTerm ? { q: debouncedTerm } : {}),
    ...(subject === "All subjects" ? {} : { subject }),
    ...(level === "All levels" ? {} : { level }),
    ...(category === "All types" ? {} : { category }),
    sort,
  };
  const materialsQuery = useInfiniteQuery({
    queryKey: ["exam-materials", filters],
    queryFn: ({ pageParam }) => fetchMaterials({ ...filters, page: pageParam, perPage: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
  const data = materialsQuery.data?.pages.flatMap((page) => page.materials) ?? [];
  const firstPage = materialsQuery.data?.pages[0];

  const buy = useMutation({
    mutationFn: purchaseMaterial,
    onSuccess: ({ checkout }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-materials"] });
      const url = checkout.authorizationUrl;
      if (!url) {
        toast.error("We could not open the payment page. Please try again.");
        return;
      }
      window.location.assign(url);
    },
    onError: () => toast.error("We could not complete that payment. Please try again."),
  });

  const subjects = useMemo(
    () => ["All subjects", ...Array.from(new Set([...(firstPage?.facets?.subjects ?? []), ...data.map((m) => m.subject)])).sort()],
    [data, firstPage?.facets?.subjects],
  );
  const owned = data.filter((m) => m.owned);

  return (
    <div className="space-y-7">
      <section className="surface-panel p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Exam materials</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          Revision packs built by specialists who have marked the papers.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Past papers, question banks, condensed notes and model answers. Pay once for a pack and download it
          immediately. Purchases stay in your library for the rest of your programme.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <span>{(firstPage?.total ?? data.length) || "-"} packs available</span>
          <span>{owned.length} in your library</span>
          <span>Instant download after payment</span>
        </div>
      </section>

      <section className="surface-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by title, topic or subject"
              aria-label="Search exam materials"
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FilterSelect label="Subject" value={subject} onChange={setSubject} options={subjects} />
            <FilterSelect label="Level" value={level} onChange={setLevel} options={["All levels", ...MATERIAL_LEVELS]} />
            <FilterSelect
              label="Type"
              value={category}
              onChange={setCategory}
              options={["All types", ...MATERIAL_CATEGORIES]}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={["popular", "newest", "price_low", "rating"]}
              labels={{
                popular: "Most downloaded",
                newest: "Newest first",
                price_low: "Lowest price",
                rating: "Highest rated",
              }}
            />
          </div>
        </div>
      </section>

      {materialsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="surface-panel space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="surface-panel p-10 text-center">
          <BookMarked className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold">No packs match those filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust the filters, or ask support to prepare a pack for your paper.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              pending={buy.isPending && buy.variables === material.id}
              onBuy={() => buy.mutate(material.id)}
            />
          ))}
        </div>
      )}
      {!materialsQuery.isLoading && data.length > 0 && (
        <div className="flex flex-col items-center gap-2 py-2">
          {materialsQuery.hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              disabled={materialsQuery.isFetchingNextPage}
              onClick={() => materialsQuery.fetchNextPage()}
            >
              {materialsQuery.isFetchingNextPage ? "Loading more…" : "Load more materials"}
            </Button>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">No more materials</p>
          )}
        </div>
      )}
    </div>
  );
}

function MaterialCard({
  material,
  pending,
  onBuy,
}: {
  material: ExamMaterial;
  pending: boolean;
  onBuy: () => void;
}) {
  return (
    <article className="surface-panel flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
          {material.category}
        </span>
        <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-muted-foreground">
          <Star className="size-3.5 fill-gold text-gold" />
          {material.rating.toFixed(1)}
        </span>
      </div>

      <h2 className="mt-3 font-display text-[0.98rem] font-semibold leading-snug">{material.title}</h2>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{material.summary}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-[0.72rem] text-muted-foreground">
        <div>
          <dt className="font-semibold text-foreground">{material.subject}</dt>
          <dd>{material.level}</dd>
        </div>
        <div className="text-right">
          <dt className="flex items-center justify-end gap-1 font-semibold text-foreground">
            <FileType2 className="size-3.5" /> {material.format}
          </dt>
          <dd>
            {material.pages} pages, {material.year}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="font-display text-lg font-semibold">
            {material.currency} {material.price}
          </p>
          <p className="text-[0.7rem] text-muted-foreground">{material.downloads.toLocaleString()} downloads</p>
        </div>
        {material.owned ? (
          <button
            type="button"
            onClick={() =>
              void downloadMaterial(material).catch(() =>
                toast.error("We could not download that file. Please try again."),
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-success/40 bg-success/12 px-4 py-2 text-xs font-semibold text-success transition-opacity hover:opacity-90"
          >
            <ArrowDownToLine className="size-3.5" /> Download
          </button>
        ) : (
          <button
            type="button"
            onClick={onBuy}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Processing" : "Pay and download"}
          </button>
        )}
      </div>

      {material.owned && (
        <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-success">
          <Check className="size-3.5" /> In your library
        </p>
      )}
    </article>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={cn(
          "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
