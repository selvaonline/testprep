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
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger className="px-4">
            {subject}
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Practice {subject} questions aligned with Texas board and STAR exam standards for Grade {grade}.
              </p>
              <Button
                onClick={() => {
                  // Make sure grade is a number and subject is properly formatted
                  const path = `/practice/${Number(grade)}/${encodeURIComponent(subject)}`;
                  console.log('Navigating to practice test:', { path, grade: Number(grade), subject });
                  setLocation(path);
                }}
                className="w-full"
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
