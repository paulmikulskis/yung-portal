"use client";
import type { SupabaseFileNode, FileTreeNodes } from "@/exports/data.types";
import {
  Dir,
  FileTree,
  FileTreeNode,
  createFileTree,
  isDir,
  isFile,
} from "exploration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useRef, useState } from "react";
import FileTreeBody from "./FileTreeBody";
import { Card } from "../ui/card";
import { Session, User } from "@supabase/supabase-js";
import UppyDash from "./UppyDash";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { Button } from "../ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendSupabaseFile } from "../actions/email";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
function FileTreeRoot({
  files,
  user,
  session,
}: {
  files: FileTreeNodes;
  user: User;
  session: Session;
}) {
  const supabase = createClientComponentClient();
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);

  const onPDFLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  // Function to render pages
  const renderPages = () => {
    const pages: JSX.Element[] = [];

    for (let i = 1; i <= (numPages || 0); i++) {
      pages.push(
        <div key={i} className="mb-4">
          {/* 1rem gap */}
          <div
            style={{
              width: pageWidth,
              height: pageHeight,
              overflow: "hidden",
            }}
          >
            <Page
              pageNumber={i}
              onLoadSuccess={onPDFPageLoadSuccess}
              width={pageWidth}
              height={pageHeight}
              className="overflow-hidden"
            />
          </div>
        </div>
      );
    }

    return pages;
  };
  const onPDFPageLoadSuccess = ({ width, height }: any) => {
    setPageWidth(width);
    setPageHeight(height);
    // If you need to scale down/up the PDF page to fit it within the container, you can set the scale here.
    const calculatedScale = parentWidth / width; // assuming parentWidth is available from your existing code
    setScale(calculatedScale);
  };

  const [newlyUploaded, setNewlyUploaded] = useState<string[] | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const tree = createFileTree((parent, { createFile, createDir }) =>
    Promise.resolve(
      files[parent.data.name].map(
        (stat: { name: string; type: "file" | "dir" }) => {
          if (stat.type === "file") {
            return createFile({ name: stat.name });
          }
          return createDir({ name: stat.name });
        }
      )
    )
  );
  const [fileTree, setFileTree] = useState<FileTree<{}>>(tree);

  const canvasRef = useRef();
  const [parentWidth, setParentWidth] = useState<number>(0);

  useEffect(() => {}, [selectedPdf, canvasRef, selectedFile]);
  if (newlyUploaded !== null) {
    setNewlyUploaded(null);
    console.log(`newlyUploaded files!\n  ${newlyUploaded.join(",\n  ")}`);
    for (const uploadedFile of newlyUploaded) {
      fileTree.loadNodes(fileTree.root).then(() => {
        const uploads = fileTree.getByPath(`/Uploads`);
        if (uploads && isDir(uploads)) {
          fileTree.loadNodes(uploads).then(() => {
            console.log(`CREATING A NEW FILE: ${uploadedFile}`);
            fileTree.newFile(uploads, { name: uploadedFile });
          });
        }
      });
    }
  }

  const downloadFileTreeNode = async () => {
    if (selectedFile && isFile(selectedFile)) {
      supabase.storage
        .from(user.email ?? "NO_USER")
        .download(selectedFile.path)
        .then((res) => {
          if (res.data !== null) {
            const url = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.download = selectedFile.basename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
    }
  };

  return (
    <div className="h-[80vh] flex flex-col lg:flex-row w-full">
      <div className="bg-card w-full md:w-1/2 lg:w-1/3 border-none pb-2 flex flex-col gap-4 justify-between">
        <div className="overflow-scroll h-[60vh]">
          <FileTreeBody
            tree={fileTree}
            user={user}
            setSelectedPdf={setSelectedPdf}
            setSelectedFile={setSelectedFile}
          />
        </div>
        <UppyDash
          user={user}
          session={session}
          setNewlyUploaded={setNewlyUploaded}
        />
        <div className="flex flex-row w-full justify-between p-2 gap-4">
          {selectedFile !== null && (
            <>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => downloadFileTreeNode()}
              >
                Download
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-full">
                    Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Email file</DialogTitle>
                    <DialogDescription>
                      {selectedFile?.basename}
                    </DialogDescription>
                  </DialogHeader>
                  <form action={sendSupabaseFile}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Send to
                        </Label>
                        <Input
                          id="sendTo"
                          type="email"
                          name="sendTo"
                          value={user.email ?? "shrek@farfaraway.com"}
                          className="col-span-3"
                        />
                      </div>
                      <input
                        type="hidden"
                        name="filePath"
                        value={selectedFile.path.slice(1)}
                      />
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Message (optional)
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={`Cheers!\n  - ${
                            user.email ?? "your colleague"
                          }`}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogTrigger asChild>
                        <Button type="submit">Send!</Button>
                      </DialogTrigger>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      {selectedPdf && (
        <div className="w-fit p-2 overflow-scroll h-[80vh] border border-muted-foreground">
          <Document
            file={selectedPdf ?? undefined}
            onLoadSuccess={onPDFLoadSuccess}
          >
            {renderPages()}
          </Document>
        </div>
      )}
    </div>
  );
}

export default FileTreeRoot;
