import * as z from "zod";
import { Fragment, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

const objectId = z
  .string()
  .length(24, "Select a valid record from the list.")

const gradingFormSchema = z.object({
  manualGatePassNumber: z.union([
    z.undefined(),
    z.number().positive("Enter a positive gate pass number."),
  ]),
  farmerStorageLinkId: objectId,
  createdBy: objectId,
  variety: z.string().min(1, "Select a variety."),
  date: z.string().datetime("Select a valid date."),
  remarks: z.string(),
})

const CreateGradingForm = () => {
  return (
    <div>CreateGradingForm</div>
  )
}

export default CreateGradingForm