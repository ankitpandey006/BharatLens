import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <Card className="transition duration-300 hover:border-[#9BB6E5] hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 text-sm leading-7 text-[#111827]/85">{children}</CardContent>
    </Card>
  );
}
