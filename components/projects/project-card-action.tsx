"use client";
import { deleteProjectAction } from "@/actions/project";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
export function ProjectCardAction({
  projectId,
}: Readonly<{
  projectId: string;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`projects/${projectId}`}>
            <ExternalLink className="mr-2 h-4 w-4" /> Open
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (confirm("Delete this project?")) {
              deleteProjectAction(projectId);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
