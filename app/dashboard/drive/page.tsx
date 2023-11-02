import FileTreeRoot from "@/components/drive/FileTreeRoot";
import UppyDash from "@/components/drive/UppyDash";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import { YungSupabaseClient } from "@/lib/storage/exporter-supabase";
import { SBFileTreeFlatten } from "@/lib/storage/file-tree";
import {
  Session,
  User,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function DriveHome() {
  const storage = new YungSupabaseClient();
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email;
  if (!userEmail) {
    return (
      <div className="flex flex-col gap-4 xl:px-40 lg:px-20 lg:pt-20 lg:pb-0 pb-0 p-8 ">
        <h1 className="text-4xl">You need to be logged in to view this page</h1>
      </div>
    );
  }
  const session = await supabase.auth.getSession();
  const files = await storage.listBucketTree(userEmail);
  console.log(`files: ${JSON.stringify(files, null, 2)}`);
  const formattedfiles = SBFileTreeFlatten(files);

  console.log(`flat: ${JSON.stringify(formattedfiles, null, 2)}`);
  return (
    <div className="flex flex-row gap-12 w-full">
      <a href="/dashboard">
        <BackArrowSmall className="w-4 text-muted-foreground hover:text-foreground" />
      </a>

      <div className="flex flex-col gap-4 pb-0 p-8 w-full">
        <h1 className="text-4xl">
          {`${user?.user_metadata.firstName}'s` ?? "Your"} drive:
        </h1>
        {/* {files.map((file) => (
        <div key={file.name}>
          <h2>{file.name}</h2>
          {file.children?.map((child) => (
            <div key={child.name} className="pl-4">
              <h3>{child.name}</h3>
            </div>
          ))}
        </div>
      ))} */}
        <div className="flex flex-col md:flex-row gap-2 h-full">
          <FileTreeRoot
            files={formattedfiles}
            user={user as User}
            session={session.data.session as Session}
          />
        </div>
      </div>
    </div>
  );
}

export default DriveHome;
