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
          className="text-blue-600 hover:underline text-lg font-medium"
        >
          {subject}
        </button>
      </div>
      <button
        onClick={handleClick}
        className="text-blue-600 hover:text-blue-800"
      >
        ▶
      </button>
    </div>
  );
}
