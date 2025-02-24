import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

interface TestCategoryProps {
  grade: number;
  subject: string;
}

export default function TestCategory({ grade, subject }: TestCategoryProps) {
  const [, setLocation] = useLocation();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
      <Accordion type="single" collapsible>
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent group-hover:text-primary transition-colors">
                {subject}
              </span>
              <span className="text-sm text-muted-foreground">Grade {grade}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6 space-y-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Practice {subject} questions aligned with Texas board and STAR exam standards for Grade {grade}.
                </p>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-primary/10 rounded-md">Multiple Choice</span>
                  <span className="px-2 py-1 bg-primary/10 rounded-md">Instant Feedback</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  const path = `/practice/${Number(grade)}/${encodeURIComponent(subject)}`;
                  console.log('Navigating to practice test:', { path, grade: Number(grade), subject });
                  setLocation(path);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
              >
                Start Practice Test
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
