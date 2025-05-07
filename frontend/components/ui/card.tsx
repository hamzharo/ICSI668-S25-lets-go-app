import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-white shadow-sm", className)} {...props} />
));

const CardHeader = ({ className, ...props }) => (
  <div className={cn("border-b px-4 py-3", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-4", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
