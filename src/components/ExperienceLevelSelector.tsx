
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const experienceLevels = [
  {
    title: "🎓 Entry-level",
    description: "Students & recent graduates (less than 2 years of experience)",
    level: "entry",
  },
  {
    title: "👤 Mid-level",
    description: "2–10 years of relevant work experience",
    level: "mid",
  },
  {
    title: "👔 Senior-level",
    description: "More than 10 years of relevant experience",
    level: "senior",
  },
];

interface ExperienceLevelSelectorProps {
  onSelect: (level: string) => void;
}

export function ExperienceLevelSelector({ onSelect }: ExperienceLevelSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {experienceLevels.map((exp) => (
        <Card key={exp.level}>
          <CardHeader>
            <CardTitle>{exp.title}</CardTitle>
            <CardDescription>{exp.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onSelect(exp.level)} className="w-full">
              CHOOSE
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
