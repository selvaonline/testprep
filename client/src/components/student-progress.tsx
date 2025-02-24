import { Card, CardContent } from "@/components/ui/card";
import { Attempt } from "@shared/schema";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StudentProgressProps {
  attempts: Attempt[];
}

export default function StudentProgress({ attempts }: StudentProgressProps) {
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const incorrectAttempts = attempts.length - correctAttempts;

  const data = [
    { name: "Correct", value: correctAttempts },
    { name: "Incorrect", value: incorrectAttempts }
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold">
            {attempts.length > 0
              ? Math.round((correctAttempts / attempts.length) * 100)
              : 0}%
          </div>
          <div className="text-sm text-muted-foreground">
            Overall Success Rate
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center mt-4">
          <div>
            <div className="text-2xl font-bold">{correctAttempts}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{incorrectAttempts}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
