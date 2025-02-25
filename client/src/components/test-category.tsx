import { useLocation } from "wouter";

interface TestCategoryProps {
  grade: number;
  subject: string;
}

export default function TestCategory({ grade, subject }: TestCategoryProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    const path = `/practice/${Number(grade)}/${encodeURIComponent(subject)}`;
    console.log('Navigating to practice test:', { path, grade: Number(grade), subject });
    setLocation(path);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <button
          onClick={handleClick}
          className="text-[#E67E23] hover:underline text-lg font-medium"
        >
          {subject}
        </button>
      </div>
      <button
        onClick={handleClick}
        className="text-[#E67E23] hover:text-[#d17320]"
      >
        ▶
      </button>
    </div>
  );
}
