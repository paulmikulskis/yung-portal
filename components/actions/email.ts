"use server";
import { EmailTemplate } from "../admin/users/EmailTemplate";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { blobToBuffer } from "@/lib/storage/helper-funcs";

/**
 * Sends an email with a file attachment using the Resend API and Supabase storage.
 *
 * @param formData - The form data containing the file path, recipient email, and message.
 * @returns A Promise that resolves when the email is sent successfully, or rejects with an error.
 */
export async function sendSupabaseFile(formData: FormData) {
  const filePath = formData.get("filePath") as string;
  const sendTo = formData.get("sendTo") as string;
  const message = formData.get("message") as string;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createServerActionClient({ cookies });
  try {
    console.log(
      `about to send an email using resend!\n  filePath: ${filePath}\n  sendTo: ${sendTo}\n  message: ${message}\n  RESEND_API_KEY: ${process.env.RESEND_API_KEY}`
    );
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) {
      console.log(`No user found when trying to send email for ${filePath}`);
      throw new Error("No user found");
    }
    const file = await supabase.storage
      .from(`${user.email ?? "NO_USER"}`)
      .download(filePath);
    if (file.error) {
      console.log(`Error downloading file: ${file.error.message}`);
      throw new Error(file.error.message);
    }
    const data = await resend.emails.send({
      from: "Yungsten Tech <drive@yungstentech.com>",
      to: [sendTo ?? "mikulskisp@gmail.com"],
      subject: filePath.split("/").pop() ?? "your-file",
      react: EmailTemplate({ firstName: `${user.user_metadata.firstName}` }),
      text: message ?? "Delivering your file, from Yungsten Tech",
      attachments: [
        {
          filename: filePath.split("/").pop() ?? "your-file",
          content: await blobToBuffer(file.data),
        },
      ],
    });
    console.log(`Email sent! ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`Error sending email: ${(error as Error).message}`);
  }
}
