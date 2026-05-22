import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartPanel({
  title,
  children,
  action
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="min-h-[320px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="h-[250px]">{children}</CardContent>
    </Card>
  );
}
