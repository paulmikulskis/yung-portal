"use client";
import type { SupabaseFileNode, FileTreeNodes } from "@/exports/data.types";
import {
  createFileTree,
  Dir,
  File,
  FileTree,
  FileTreeNode,
  isDir,
  isFile,
  Node,
  useDnd,
  useHotkeys,
  useObserver,
  useRovingFocus,
  useSelections,
  useTraits,
  useVirtualize,
} from "exploration";
import { createStyles } from "@dash-ui/styles";
import reset from "@dash-ui/reset";
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscCloudDownload,
  VscNewFolder,
  VscNewFile,
  VscTrash,
} from "react-icons/vsc";
import * as colors from "@radix-ui/colors";
import React, { useEffect, useState } from "react";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { Input } from "../ui/input";

function FileTreeBody({
  tree,
  user,
  setSelectedPdf,
  setSelectedFile,
}: {
  tree: FileTree;
  user: User;
  setSelectedPdf: React.Dispatch<React.SetStateAction<Blob | null>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileTreeNode | null>>;
}) {
  const supabase = createClientComponentClient();
  const controllerRef = React.useRef<HTMLDivElement | null>(null);
  const windowRef = React.useRef<HTMLDivElement | null>(null);
  const rovingFocus = useRovingFocus(tree);
  const selections = useSelections(tree);
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const traits = useTraits(tree, ["selected", "focused", "drop-target"]);
  const dnd = useDnd(tree, { windowRef });
  const [resetDelete, setResetDelete] = useState<boolean>(false);
  const virtualize = useVirtualize(tree, { windowRef, nodeHeight: 24 });
  const [lastClickedNodeId, setLastClickedNodeId] = React.useState<
    number | null
  >(null);
  const [lastClickedTime, setLastClickedTime] = React.useState<number | null>(
    null
  );

  const handleFileTreeNodeDelete = async (node: FileTreeNode) => {
    const fileTreeNodeDelete = async (node: FileTreeNode) => {
      const path = `${node.path.slice(1)}`;
      return sbClientDelete(path);
    };

    const sbClientDelete = async (path: string) => {
      console.log(`Deleting ${path} in bucket "${user.email}"`);
      return supabase.storage
        .from(user.email ?? "NO_USER")
        .remove([path])
        .then((resp) => {
          return resp;
        });
    };

    const deleteChildren = async (inputNode: FileTreeNode) => {
      const promises: Promise<any>[] = [];
      console.log(
        `calling deleteChildren with ${inputNode.data.name}\n"node.nodes" is ${
          isDir(inputNode) ? inputNode.nodes : "undefined"
        },\nisDir: ${isDir(inputNode)}`
      );
      const node = tree.getById(inputNode.id);
      node && isDir(node) && (await tree.loadNodes(node as Dir));
      if (node && isDir(node) && node.nodes) {
        promises.push(
          sbClientDelete(node.path.slice(1) + "/.emptyFolderPlaceholder")
        );
        for (const child of node.nodes) {
          const childNode = tree.getById(child);
          if (childNode) {
            if (isFile(childNode)) {
              console.log(`calling fileTreeNodeDelete with ${childNode.path}`);
              promises.push(fileTreeNodeDelete(childNode));
            } else if (isDir(childNode)) {
              promises.push(deleteChildren(childNode));
            }
          }
        }
      } else {
        if (node && isFile(node)) {
          console.log(`calling fileTreeNodeDelete with ${node.path}`);
          promises.push(fileTreeNodeDelete(node));
        }
      }

      await Promise.all(promises);
    };

    await deleteChildren(node);
    tree.remove(node);
  };

  const sbClientMove = async (
    node: FileTreeNode,
    destination: string,
    useBasename?: boolean
  ) => {
    const from = `${node.path.slice(1)}`;
    const to = `${
      destination.slice(1).length && destination[0] === "/"
        ? destination.slice(1) + "/"
        : destination.length
        ? destination + "/"
        : ""
    }${node.basename}`;
    console.log(`Moving ${from} to ${to} in bucket "${user.email}"`);
    return supabase.storage
      .from(user.email ?? "NO_USER")
      .move(from, to)
      .then((resp) => {
        return resp;
      });
  };

  const sbClientDownload = async (path: string) => {
    const urlDownload = supabase.storage
      .from(user.email ?? "NO_USER")
      .download(path)
      .then((res) => {
        const data: Blob | null = res.data;
        if (data) {
          const url = URL.createObjectURL(data);
          const link = document.createElement("a");
          link.download = path.split("/").pop() ?? "file";
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
  };
  useHotkeys(tree, { windowRef, rovingFocus, selections });

  useObserver(selections.didChange, (value) => {
    const selected = [...value];
    traits.set("selected", selected);

    if (selected.length === 1) {
      const currentTime = new Date().getTime();
      const node = tree.getById(selected[0]);

      if (node && isFile(node)) {
        setSelectedFile(node);
        if (node.basename.endsWith(".pdf")) {
          supabase.storage
            .from(user.email ?? "NO_USER")
            .download(node.path)
            .then((res) => {
              const url = res.data;
              console.log(`signed url: ${url}`);
              setSelectedPdf(url ?? null);
            });
        }
        console.log("Opening file:", node.data.name);
        // Detect a double click
        if (
          lastClickedNodeId === node.id &&
          currentTime - (lastClickedTime || 0) <= 500
        ) {
          sbClientDownload(node.path);
        }

        // Update the last clicked node ID and time
        setLastClickedNodeId(node.id);
        setLastClickedTime(currentTime);
      }
    }
  });

  useObserver(rovingFocus.didChange, (value) => {
    traits.set("focused", [value]);
  });

  useObserver(dnd.didChange, (event) => {
    if (!event) return;

    if (event.type === "enter" || event.type === "expanded") {
      if (event.node.parentId === event.dir.id) {
        return traits.clear("drop-target");
      }

      const nodes = event.dir.nodes ? [...event.dir.nodes] : [];
      const nodeIds: number[] = [event.dir.id, ...nodes];
      let nodeId: number | undefined;

      while ((nodeId = nodes.pop())) {
        const node = tree.getById(nodeId);

        if (node) {
          if (isDir(node) && node.nodes) {
            nodeIds.push(...node.nodes);
            nodes.push(...node.nodes);
          }
        }
      }

      traits.set("drop-target", nodeIds);
    } else if (event.type === "drop") {
      console.log("drop");
      console.log(JSON.stringify(event, null, 2));
      if (event.node.$$type === "file") {
        sbClientMove(event.node, event.dir.path).then((resp) => {
          console.log(`response from move: ${JSON.stringify(resp, null, 2)}`);
        });
      } else {
        // else, we need to recursively move all children, preserving the directory structure to `event.dir.path`
        const moveChildren = async (
          inputNode: FileTreeNode,
          destination: string
        ) => {
          const promises: Promise<any>[] = [];
          console.log(
            `calling moveChildren with ${
              inputNode.data.name
            }, going to "${destination}"\n"node.nodes" is ${
              isDir(inputNode) ? inputNode.nodes : "undefined"
            },\nisDir: ${isDir(inputNode)}`
          );
          const node = tree.getById(inputNode.id);

          if (node && isDir(node) && node.nodes) {
            for (const child of node.nodes) {
              const childNode = tree.getById(child);
              if (childNode && childNode.$$type === "file") {
                console.log(
                  `calling sbClientMove with ${childNode.path}\ngoing to: ${
                    destination.length ? destination + "/" : ""
                  }${node.basename}`
                );
                promises.push(
                  sbClientMove(
                    childNode,
                    `${destination.length ? destination + "/" : ""}${
                      node.basename
                    }`
                  )
                );
              } else if (childNode && childNode.$$type === "dir") {
                promises.push(
                  moveChildren(
                    childNode,
                    `${destination.length ? destination + "/" : ""}${
                      node.basename
                    }`
                  )
                );
              }
            }
          }

          await Promise.all(promises);
        };
        moveChildren(
          event.node,
          `${event.dir.path === "/" ? "" : event.dir.path}`
        );
      }

      traits.clear("drop-target");
      const selected = new Set(selections.narrow());

      if (
        event.node === event.dir ||
        (selected.has(event.node.id) && selected.has(event.dir.id))
      ) {
        return;
      }

      if (selected.has(event.node.id)) {
        const moveSelections = async () => {
          if (!tree.isVisible(event.dir)) {
            await tree.expand(event.dir);
          }

          const promises: Promise<void>[] = [];

          for (const id of selected) {
            const node = tree.getById(id);

            if (node) {
              console.log(
                `(1!) Moving ${node.data.name} to ${event.dir.data.name}`
              );
              promises.push(tree.move(node as File, event.dir));
            }
          }

          await Promise.all(promises);
        };

        moveSelections();
        selections.clear();
      } else {
        tree.move(event.node as File, event.dir);
      }
    } else if (event.type === "end") {
      console.log("end");
      traits.clear("drop-target");
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controllerRef.current &&
        !controllerRef.current.contains(event.target as Node)
      ) {
        selections.clear();
        setResetDelete((res) => !res);
        setNewFolder(null);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleNewFolder = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const selected = [...selections.narrow()];
      console.log(`SELECTED: ${JSON.stringify(selected, null, 2)}`);
      const dirNums = selected.filter((s) => {
        const d = tree.getById(s);
        return d && isDir(d);
      });
      console.log(`SELECTED DIRS: ${JSON.stringify(dirNums, null, 2)}`);
      const dir = dirNums.pop() ?? tree.root.id;
      const node = tree.getById(dir);
      if (node && isDir(node)) {
        const newFolderName = newFolder ?? "New Folder";

        const newFolderRes = tree.newDir(node, {
          name: newFolderName,
        });
        console.log(
          `CREATING NEW FOLDER "${newFolderName}" IN ${JSON.stringify(
            node,
            null,
            2
          )}\nresult: ${JSON.stringify(
            newFolderRes,
            null,
            2
          )}\nuploading file "${newFolderRes.path.slice(
            1
          )}/.emptyFolderPlaceholder" to supabase`
        );
        await supabase.storage
          .from(user.email ?? "NO_USER")
          .upload(
            `${newFolderRes.path.slice(1)}/.emptyFolderPlaceholder`,
            new Blob([""], { type: "text/plain" })
          );
        setNewFolder(null);
      }
    }
  };

  const plugins = [traits, rovingFocus, selections, dnd];

  return (
    <div className="flex flex-col" ref={controllerRef}>
      <div className="w-full h-6 rounded-t-md bg-card p-1 mt-1 px-4 flex flex-row justify-between items-center text-muted-foreground flex-reverse">
        <div className="flex flex-row gap-2 items center w-full justify-end">
          {newFolder !== null && (
            <Input
              className="px-1 rounded-none h-5 mx-2"
              autoFocus={true}
              onInput={(e) => setNewFolder(e.currentTarget.value)}
              onKeyDown={(e) => handleNewFolder(e)}
            />
          )}
          {selections.head !== null && (
            <button
              className="hover:text-foreground"
              onClick={() =>
                [...selections.narrow()]
                  .map((id) => tree.getById(id) as FileTreeNode)
                  .forEach((node) => handleFileTreeNodeDelete(node))
              }
            >
              <VscTrash />
            </button>
          )}
          <button
            className="hover:text-foreground"
            onClick={() => setNewFolder("")}
          >
            <VscNewFolder />
          </button>
        </div>
      </div>
      <hr className="border-[1px] border-background/50 mb-1" />
      <div ref={windowRef} className={explorerStyles()}>
        <div
          {...virtualize.props}
          className="flex flex-col gap-1 text-muted-foreground"
        >
          {virtualize.map((props) => {
            const depth = props.node.depth;
            return (
              <div key={props.node.id}>
                <Node plugins={plugins} {...props}>
                  <div
                    className="flex justify-between items-center mr-3 gap-2"
                    style={{ paddingLeft: `${depth}rem` }}
                  >
                    <div
                      className="flex items-center gap-1 w-full"
                      style={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isDir(props.node) ? (
                        props.node.expanded ? (
                          <div className="text-amber-500">
                            <VscFolderOpened />
                          </div>
                        ) : (
                          <div className="text-amber-500/70">
                            <VscFolder />
                          </div>
                        )
                      ) : (
                        <div className="text-sky-600">
                          <VscFile />
                        </div>
                      )}

                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {props.node.basename}
                      </span>
                    </div>
                    {isFile(props.node) && (
                      <button
                        className="hover:text-foreground text-muted-foreground"
                        onClick={() => sbClientDownload(props.node.path)}
                      >
                        <VscCloudDownload />
                      </button>
                    )}
                  </div>
                </Node>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FileTreeBody;

const styles = createStyles({});

const explorerStyles = styles.one((t) => ({
  ".selected": {
    backgroundColor: "hsl(var(--secondary))",
    color: "hsl(var(--accent-foreground))",
    fontWeight: 500,
  },

  ".focused": {
    outline: "none",
  },

  ".drop-target": {
    backgroundColor: "hsl(var(--secondary))",
  },
}));
