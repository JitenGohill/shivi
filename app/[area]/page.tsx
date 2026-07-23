import Link from "next/link";
import { notFound } from "next/navigation";
import { findPlanningArea, planningAreas } from "@/lib/planning-areas";
import { getWedding } from "@/lib/wedding-store";

type PlanningAreaPageProps = {
  params: Promise<{
    area: string;
  }>;
};

export function generateStaticParams() {
  return planningAreas
    .filter(
      (area) =>
        area.href !== "/events" && area.href !== "/tasks" && area.href !== "/vendors"
    )
    .map((area) => ({
      area: area.href.slice(1)
    }));
}

export default async function PlanningAreaPage({ params }: PlanningAreaPageProps) {
  const { area: slug } = await params;
  const area = findPlanningArea(slug);

  if (!area) {
    notFound();
  }

  const wedding = await getWedding();

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>{area.label}</h1>
          <p className="lede">{area.summary}</p>
        </div>
        <Link className="secondary-link" href="/">
          Back to Dashboard
        </Link>
      </header>

      <section className="empty-state" aria-label={`${area.label} placeholder`}>
        <p className="eyebrow">Ready for later slice</p>
        <h2>{area.label} workspace</h2>
        <p>
          This destination is wired into the single-Wedding app shell so future
          issue slices can add real records without adding workspace selection or
          tenant switching.
        </p>
      </section>
    </div>
  );
}
