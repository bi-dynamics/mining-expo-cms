"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { createExhibitor } from "@/lib/Exhibitors/actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/app/firebase/config";

const formSchema = z.object({
  logo: z
    .instanceof(File)
    .refine((file) => file.size < 2000000, "Logo must be less than 2MB.")
    .optional(),
  name: z.string().min(1, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "draft"]),
});

export default function CreateExhibitor() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: undefined,
      name: "",
      description: "",
      status: "active",
    },
  });

  const [years, setYears] = useState<string[]>([]);
  const [yearInput, setYearInput] = useState("");

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

  // Upload logo to Firebase Storage and return the URL
  const uploadLogo = async (file: File): Promise<string> => {
    const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
    const storageRef = ref(storage, `img/exhibitors/${uniqueFileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    let logoUrl = "";
    if (values.logo) {
      logoUrl = await uploadLogo(values.logo);
    }
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("status", values.status);
    formData.append("yearsAtEvent", JSON.stringify(years.map(Number)));
    if (logoUrl) formData.append("logo", logoUrl);

    toast.info(
      values.status === "active" ? "Publishing exhibitor" : "Saving as draft"
    );
    try {
      await createExhibitor(formData);
      toast.success(`Exhibitor saved as ${values.status}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit((values) => {
      handleSubmit({ ...values, status: "draft" });
    })();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new Exhibitor</CardTitle>
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
                    <Input type="text" {...field} />
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
                    <Textarea
                      placeholder="Write a description for your exhibitor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        onChange(event.target.files && event.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Years at Event as badges */}
            <FormItem>
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
                  className="w-32"
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
                      defaultValue="active"
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
              Publish
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              variant="outline"
              className="w-full disabled:opacity-50"
            >
              Save as draft
            </Button>
            <Link href="/dashboard/exhibitors">
              <Button variant="ghost" className="w-full disabled:opacity-50">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
