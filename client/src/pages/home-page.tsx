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

  const subjects = ["Math", "Reading", "Science", "Social Studies"];
  const grades = [3, 4, 5, 6, 7, 8];
  const [selectedGrade, setSelectedGrade] = useState(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
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

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[2fr,1fr] gap-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Practice Tests
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Grade:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              {subjects.map((subject) => {
                if (!user) return null;
                return (
                  <TestCategory
                    key={subject}
                    grade={selectedGrade}
                    subject={subject}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
            <StudentProgress attempts={attempts || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
