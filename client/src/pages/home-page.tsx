import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import TestCategory from "@/components/test-category";
import StudentProgress from "@/components/student-progress";
import { Attempt } from "@shared/schema";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: attempts } = useQuery<Attempt[]>({
    queryKey: ["/api/attempts"],
  });

  const subjects = ["Math", "Reading"];
  const grades = [3, 4, 5, 6, 7, 8, "High School"];
  const [expandedGrade, setExpandedGrade] = useState<string | number>(3);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#E67E23]">
            TestPrep
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[2fr,1fr] gap-12">
          <div className="space-y-0 border rounded-lg overflow-hidden">
            {grades.map((grade) => (
              <div key={grade} className="border-b last:border-b-0">
                <button
                  onClick={() => setExpandedGrade(grade)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="text-lg font-semibold text-[#E67E23]">
                    Grade {grade}
                  </span>
                  <span className={`transform transition-transform ${expandedGrade === grade ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedGrade === grade && (
                  <div className="px-6 py-4 space-y-4">
                    {subjects.map((subject) => (
                      <TestCategory
                        key={subject}
                        grade={typeof grade === 'number' ? grade : 12}
                        subject={subject}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Progress</h2>
            <StudentProgress attempts={attempts || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
