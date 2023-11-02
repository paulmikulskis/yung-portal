"use client";
import React, { useEffect } from "react";
import Uppy from "@uppy/core";
import Webcam from "@uppy/webcam";
import { Dashboard } from "@uppy/react";

// Don't forget the CSS: core and the UI components + plugins you are using.
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import Tus from "@uppy/tus";
import { createStyles } from "@dash-ui/styles";
import { Session, User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function UppyDash({
  user,
  session,
  setNewlyUploaded,
}: {
  user: User;
  session: Session;
  setNewlyUploaded: React.Dispatch<React.SetStateAction<string[] | null>>;
}) {
  const token = session.access_token;
  const bucketName = `${user.email ?? "anon"}`;
  const folderName = "Uploads";
  const supabaseUploadURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;

  // Don’t forget to keep the Uppy instance outside of your component.
  const uppy = new Uppy().use(Webcam).use(Tus, {
    endpoint: supabaseUploadURL,
    headers: {
      authorization: `Bearer ${token}`,
    },
    chunkSize: 6 * 1024 * 1024,
    allowedMetaFields: [
      "bucketName",
      "objectName",
      "contentType",
      "cacheControl",
    ],
  });
  uppy.on("file-added", (file) => {
    file.meta = {
      ...file.meta,
      bucketName: bucketName,
      objectName: folderName ? `${folderName}/${file.name}` : file.name,
      contentType: file.type,
    };
  });
  uppy.on("complete", (result) => {
    console.log(
      "Upload complete! We’ve uploaded these files:",
      JSON.stringify(result.successful, null, 2)
    );
    const uploadedFiles = result.successful.map((file) => file.name);
    setNewlyUploaded(uploadedFiles);
  });
  useEffect(() => {
    const poweredByUppy = document.querySelector(
      ".uppy-Dashboard-poweredByUppy"
    );
    if (poweredByUppy) {
      // @ts-ignore
      poweredByUppy.innerText = "Yungsten Tech";
    }
  }, []);

  return (
    <div className={explorerStyles()}>
      <Dashboard
        theme={"dark"}
        uppy={uppy}
        plugins={["Webcam"]}
        height={"50vh"}
      />
    </div>
  );
}

export default UppyDash;

const styles = createStyles({});

const explorerStyles = styles.one((t) => ({
  ".uppy-Dashboard-inner": {
    border: "none",
    backgroundColor: "hsl(var(--card))",
  },

  ".drop-target": {
    backgroundColor: "hsl(var(--secondary))",
  },

  ".uppy-Dashboard-AddFiles": {},
}));
