"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getExhibitor } from "@/lib/Exhibitors/data";
import { updateExhibitor } from "@/lib/Exhibitors/actions";
import { ExhibitorType } from "@/lib/Exhibitors/definitions";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Add this import

const formSchema = z.object({
  logo: z
    .instanceof(File)
    .refine((file) => file.size < 2000000, "Logo must be less than 2MB.")
    .optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  yearsAtEvent: z.string().optional(), // comma separated years
  status: z.enum(["active", "draft"]),
});

export default function EditExhibitor({ params }: { params: { id: string } }) {
  const { id } = params;
  const [exhibitor, setExhibitor] = useState<ExhibitorType | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [years, setYears] = useState<string[]>([]);
  const [yearInput, setYearInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExhibitor = async () => {
      setIsNotFound(false);
      try {
        const exhibitor: ExhibitorType | null = await getExhibitor(id);
        if (!exhibitor) {
          setIsNotFound(true);
        } else {
          setExhibitor(exhibitor);
          setYears((exhibitor.yearsAtEvent || []).map(String));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchExhibitor();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: undefined,
      name: exhibitor?.name ?? "",
      description: exhibitor?.description ?? "",
      yearsAtEvent: "",
      status: exhibitor?.status ?? "draft",
    },
  });

  const handleAddYear = () => {
    const year = yearInput.trim();
    if (year && /^\d{4}$/.test(year) && !years.includes(year)) {
      setYears([...years, year]);
      setYearInput("");
    }
  };

  const handleRemoveYear = (year: string) => {
    setYears(years.filter((y) => y !== year));
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    if (values.name && values.name !== exhibitor?.name) {
      formData.append("name", values.name);
    }
    if (values.description && values.description !== exhibitor?.description) {
      formData.append("description", values.description);
    }
    if (values.logo) {
      formData.append("logo", values.logo);
    }
    if (values.status && values.status !== exhibitor?.status) {
      formData.append("status", values.status);
    }
    if (values.yearsAtEvent) {
      // Convert comma separated string to array of numbers
      const yearsArray = values.yearsAtEvent
        .split(",")
        .map((y) => Number(y.trim()))
        .filter((y) => !isNaN(y));
      formData.append("yearsAtEvent", JSON.stringify(yearsArray));
    }

    toast.info("Saving changes");
    try {
      await updateExhibitor(id, formData);
      toast.success("Exhibitor Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Exhibitor</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Company Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={exhibitor?.name}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder={exhibitor?.description} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder={
                        exhibitor?.logo ? "Change logo" : "No file chosen"
                      }
                      {...fieldProps}
                      accept="image/*"
                      onChange={(event) =>
                        onChange(event.target.files && event.target.files[0])
                      }
                    />
                  </FormControl>
                  {exhibitor?.logo && (
                    <FormDescription>
                      <Image
                        src={exhibitor.logo}
                        alt="Exhibitor Logo"
                        width={128}
                        height={128}
                        className="w-20 h-20"
                      />
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Years at Event as badges */}
            <FormItem className="w-full">
              <FormLabel className="font-bold">Years at Event</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {years.map((year) => (
                  <Badge
                    key={year}
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {year}
                    <button
                      type="button"
                      className="ml-1 text-xs text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveYear(year)}
                      aria-label={`Remove ${year}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="Enter year (e.g. 2023)"
                  className="w-80"
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                />
                <Button
                  type="button"
                  onClick={handleAddYear}
                  disabled={
                    !yearInput.trim() ||
                    !/^\d{4}$/.test(yearInput.trim()) ||
                    years.includes(yearInput.trim())
                  }
                >
                  Add
                </Button>
              </div>
              <FormDescription>
                Add a year and click <b>Add</b>. Click <b>×</b> to remove.
              </FormDescription>
            </FormItem>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-bold">Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={exhibitor?.status}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="draft" />
                        </FormControl>
                        <FormLabel className="font-normal">Draft</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    <strong>Drafts</strong> are not visible to users on your
                    app.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full disabled:opacity-50"
            >
              Update
            </Button>
            <Link href="/dashboard/exhibitors">
              <Button variant="ghost" className="w-full">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
