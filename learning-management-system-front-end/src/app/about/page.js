"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  const pillars = [
    {
      title: "Competitive Programming Rigor",
      desc: "Deep algorithmic intuition covering Dynamic Programming, Segment Trees, Graph Theory, and Number Theory for ICPC and Codeforces.",
      icon: "⚡",
    },
    {
      title: "Production Software Engineering",
      desc: "Real-world full-stack development, modern web architectures, distributed systems, clean code principles, and cloud deployments.",
      icon: "🛠️",
    },
    {
      title: "Interactive Evaluations & Quizzes",
      desc: "Timed multiple-choice checkpoints and hands-on coding assessments designed to validate genuine mastery before progression.",
      icon: "🎯",
    },
    {
      title: "Expert Instructor Mentorship",
      desc: "Personal guidance from ICPC World Finalists, Codeforces Masters, and Senior Software Engineers with active industry experience.",
      icon: "🎓",
    },
  ];

  const team = [
    {
      name: "Wasif Hasan",
      role: "Founder & Lead Architect",
      bio: "ICPC Regional Finalist, competitive programming mentor, and full-stack systems engineer.",
      tags: ["Algorithms", "Next.js", "Distributed Systems"],
    },
    {
      name: "Mohaimin",
      role: "Senior Instructor — CP Track",
      bio: "Codeforces Master with extensive coaching experience in advanced graph algorithms and DP.",
      tags: ["Codeforces Master", "ICPC Coach", "C++"],
    },
    {
      name: "Arafat",
      role: "Senior Instructor — Systems Track",
      bio: "Backend specialist focusing on clean architecture, microservices, databases, and interview prep.",
      tags: ["System Design", "Databases", "Clean Code"],
    },
  ];

  const stats = [
    { label: "Students Trained", value: "5,000+" },
    { label: "Contest Problem Solves", value: "250,000+" },
    { label: "ICPC Regional Finalists", value: "120+" },
    { label: "Top Tech Placements", value: "85+" },
  ];

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-11/12 mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="highlight">About CPS Academy</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Empowering the Next Generation of Problem Solvers & Engineers
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          CPS Academy is Bangladesh&apos;s premier competitive programming and software engineering academy. We bridge the gap between academic theory, contest podiums, and world-class tech careers.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button href="/courses" variant="primary" size="md">
            Explore Courses
          </Button>
          <Button href="/success-story" variant="outline" size="md">
            Read Success Stories
          </Button>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-border">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-highlight">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Core Mission & Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Our Learning Philosophy
          </h2>
          <p className="text-sm text-muted">
            Engineered from first principles to cultivate disciplined problem-solving habits and technical excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <Card key={idx} className="p-6 space-y-3 bg-surface border-border">
              <div className="text-3xl">{pillar.icon}</div>
              <h3 className="text-base font-bold text-foreground">{pillar.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{pillar.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Leadership & Instructors */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline">World-Class Mentors</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Meet the CPS Academy Faculty
          </h2>
          <p className="text-sm text-muted">
            Learn directly from seasoned contest problem solvers and software engineers who have solved thousands of problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <Card key={idx} className="flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary dark:text-highlight flex items-center justify-center font-black text-lg mb-3">
                  {member.name[0]}
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription className="text-xs font-semibold text-secondary">
                  {member.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted leading-relaxed">{member.bio}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {member.tags.map((tag, tIdx) => (
                    <Badge key={tIdx} variant="surface" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Card */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface border border-border text-center space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Ready to Accelerate Your Problem Solving Journey?
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto">
          Join thousands of learners solving algorithmic problems, acing tech interviews, and building scalable software.
        </p>
        <div className="pt-2">
          <Button href="/auth/register" variant="primary" size="md">
            Join CPS Academy Today →
          </Button>
        </div>
      </section>
    </div>
  );
}
