import { FileTreeNodes, SupabaseFileNode } from "@/exports/data.types";

export const SBFileTreeFlatten = (
  tree: SupabaseFileNode[],
  path: string = "/"
): FileTreeNodes => {
  const flat: FileTreeNodes = {};

  // Initialize the current path
  flat[path] = [];

  tree.forEach((node) => {
    // Generate the full path for the current node
    const fullPath = `${path}${path !== "/" ? "/" : ""}${node.name}`;

    if (node.folder) {
      // Recursive call to process children, if any
      if (node.children) {
        const childFlat = SBFileTreeFlatten(node.children, fullPath);

        // Merge the child paths into our flat structure
        for (const [key, value] of Object.entries(childFlat)) {
          flat[key] = value;
        }
      }
    }

    // Add this node to its parent directory in our flat structure
    // (But make sure we're not adding the directory to itself)
    if (fullPath !== path) {
      flat[path].push({ name: fullPath, type: node.folder ? "dir" : "file" });
    }
  });

  return flat;
};
