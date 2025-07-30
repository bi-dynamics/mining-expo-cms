import { TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { ExhibitorType } from "@/lib/Exhibitors/definitions";

interface ExhibitorItemProps {
  item: ExhibitorType;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export default function ExhibitorItem({ item, onDelete }: ExhibitorItemProps) {
  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <TableRow>
      <TableCell className="w-40">
        <Image
          src={item.logo}
          alt="Exhibitor Image"
          className=" aspect-square rounded-md object-cover w-40 h-24"
          height={128}
          width={128}
        />
      </TableCell>
      <TableCell className="font-bold w-40 ">{item.name}</TableCell>
      <TableCell className=" w-80 font-light line-clamp-4 overflow-ellipsis pb-0">
        {item.description}
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          {item.yearsAtEvent.map((year) => {
            return (
              <Badge variant="default" className="capitalize w-fit" key={year}>
                {year.toString()}
              </Badge>
            );
          })}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <Link href={`/dashboard/exhibitors/${item.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
