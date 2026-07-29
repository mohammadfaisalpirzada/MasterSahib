import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEDA Teaching License Learning Hub | Complete Exam Preparation 2026",
  description:
    "Complete STEDA Teaching License preparation hub — Module 0: Exam Overview & Strategy, Module 1: Educational Psychology & Child Development, Module 2: Teaching Methods, Module 3: Classroom Management. Study notes, case studies, and high-yield MCQs for Sindh teachers.",
  keywords: [
    "STEDA learning hub",
    "STEDA exam preparation",
    "Sindh Teaching License notes",
    "STEDA pedagogy notes",
    "child development STEDA",
    "Bloom taxonomy teaching license",
    "Piaget Vygotsky STEDA",
    "STEDA MCQs practice",
    "Sindh teacher license study material",
    "classroom management STEDA",
  ],
  openGraph: {
    title: "STEDA Teaching License Learning Hub | Complete Exam Preparation 2026",
    description:
      "Documentation-style learning hub for STEDA Teaching License exam. Study notes, case studies, and MCQs for Sindh teachers.",
    url: "https://themastersahib.com/teaching-license/hub",
    siteName: "TheMasterSahib",
    type: "website",
    images: [{ url: "/images/main_logo.png", width: 512, height: 512, alt: "STEDA Learning Hub" }],
  },
  alternates: { canonical: "https://themastersahib.com/teaching-license/hub" },
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
