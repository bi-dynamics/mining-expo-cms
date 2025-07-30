"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExhibitorType } from "@/lib/Exhibitors/definitions";
import {
  searchExhibitorsByName,
  getExhibitors,
  searchExhibitorsByYearsAtEvent,
} from "@/lib/Exhibitors/data";
import { deleteExhibitor } from "@/lib/Exhibitors/actions";
import ExhibitorItem from "./exhibitor-item";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";

export default function ExhibitorsTable() {
  const [exhibitors, setExhibitors] = useState<ExhibitorType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const hasPrevious = currentPage > 1;
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [yearsSort, setYearsSort] = useState<"asc" | "desc" | "off">("off");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch exhibitors or search results
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      let exhibitors: ExhibitorType[] = [];
      if (yearsSort !== "off") {
        exhibitors = await searchExhibitorsByYearsAtEvent(yearsSort);
        setHasMore(false);
      } else if (debouncedSearchTerm) {
        exhibitors = await searchExhibitorsByName(debouncedSearchTerm);
        setHasMore(false);
      } else {
        exhibitors = await getExhibitors();
        setHasMore(exhibitors.length === 5);
      }
      setExhibitors(exhibitors);
      setIsLoading(false);
    };
    fetch();
  }, [debouncedSearchTerm, refresh, yearsSort]);

  const loadMoreArticles = async () => {
    const newCurrentPage = currentPage + 1;
    setCurrentPage(newCurrentPage);
    getExhibitors(true, false);
  };

  const loadPreviousArticles = async () => {
    const newCurrentPage = currentPage - 1;
    setCurrentPage(newCurrentPage);
    getExhibitors(false, true);
  };

  const handleDelete = async (id: string) => {
    toast.info("Deleting exhibitor...");
    try {
      const result = await deleteExhibitor(id);
      if (result.success) {
        toast.success("Exhibitor deleted");
        setRefresh((prev) => !prev);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occured. " + getErrorMessage(error));
    }
  };

  // Toggle sort direction
  const handleYearsSortToggle = () => {
    setYearsSort((prev) =>
      prev === "off" ? "asc" : prev === "asc" ? "desc" : "off"
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div className="w-full">
          <CardTitle>Exhibitors</CardTitle>
          <CardDescription>Manage your exhibitors</CardDescription>
        </div>
        <div className="flex gap-2 w-full items-center">
          <Input
            type="text"
            placeholder="Search exhibitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Link href="/dashboard/exhibitors/create">
            <Button>
              <PlusCircle />
              Add Exhibitor
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={handleYearsSortToggle}
                title="Sort by Years at Event"
              >
                Years at Event
                {yearsSort === "asc" && (
                  <span className="ml-1 text-xs text-blue-500">▲</span>
                )}
                {yearsSort === "desc" && (
                  <span className="ml-1 text-xs text-blue-500">▼</span>
                )}
                {yearsSort === "off" && (
                  <span className="ml-1 text-xs text-muted-foreground">⇅</span>
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exhibitors.map((exhibitor) => (
              <ExhibitorItem
                key={exhibitor.id}
                item={exhibitor}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground"></div>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPreviousArticles}
              disabled={isLoading || !hasPrevious || !!debouncedSearchTerm}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreArticles}
              disabled={isLoading || !hasMore || !!debouncedSearchTerm}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
