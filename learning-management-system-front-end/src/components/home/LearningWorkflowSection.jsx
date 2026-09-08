import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
    HiOutlineAcademicCap,
    HiOutlineChartBarSquare,
    HiOutlineClipboardDocumentCheck,
    HiOutlinePlayCircle,
} from "react-icons/hi2";

const workflowSteps = [
  {
    step: "01",
    title: "Choose a focused track",
    description:
      "Start with a guided sequence built around algorithms, engineering foundations, or interview preparation.",
    icon: HiOutlineAcademicCap,
  },
  {
    step: "02",
    title: "Learn by building",
    description:
      "Pair clear video lessons with notes, examples, and practical checkpoints that turn theory into working skill.",
    icon: HiOutlinePlayCircle,
  },
  {
    step: "03",
    title: "Verify your progress",
    description:
      "Complete timed assessments and follow your progress through a precise learning record and scorecards.",
    icon: HiOutlineClipboardDocumentCheck,
  },
];

export function LearningWorkflowSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-4">
            <Badge variant="highlight" size="sm">
              A Clear Learning System
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Make every study session count
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-md">
              CPS Academy keeps the path from first lesson to verified mastery
              clear, practical, and measurable.
            </p>
            <Button
              href="/courses"
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Browse learning tracks
            </Button>
          </div>

          <ol className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowSteps.map(({ step, title, description, icon: Icon }) => (
              <li
                key={step}
                className="group relative min-h-56 p-5 sm:p-6 bg-card border border-border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#309255] hover:shadow-1 dark:hover:bg-surface-hover"
              >
                <span className="absolute top-5 right-5 text-xs font-black text-muted/70 group-hover:text-[#309255] dark:group-hover:text-[#E7F8EE] transition-colors">
                  {step}
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#E7F8EE] dark:bg-[#E7F8EE]/15 text-[#309255] dark:text-[#E7F8EE] border border-[#309255]/25 flex items-center justify-center mb-7">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 py-4 px-5 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#309255] text-white flex items-center justify-center shrink-0">
              <HiOutlineChartBarSquare className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Keep your learning history, milestone progress, and quiz
              scorecards in one place.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="text-xs font-bold text-[#309255] dark:text-[#E7F8EE] hover:text-foreground dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </section>
  );
}
