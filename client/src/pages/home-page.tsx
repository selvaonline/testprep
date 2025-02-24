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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">TestPrep</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[2fr,1fr] gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Practice Tests</h2>
            <div className="space-y-4">
              {subjects.map((subject) => (
                <TestCategory
                  key={subject}
                  grade={user!.grade}
                  subject={subject}
                />
              ))}
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
