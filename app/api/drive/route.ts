import { google } from "googleapis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const broker = searchParams.get("broker");

    const folderMap: Record<string, string | undefined> = {
      upstox: process.env.UPSTOX_FOLDER_ID,
      zerodha: process.env.ZERODHA_FOLDER_ID,
    };

    const folderId = folderMap[broker || ""];

    if (!folderId) {
      return Response.json(
        { success: false, error: "Invalid broker" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 1️⃣ List all CSV files
    const list = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='text/csv'`,
      fields: "files(id,name)",
      pageSize: 1000,
    });

    const files = list.data.files || [];

    // 2️⃣ Fetch all file contents (parallel but controlled)
    const results = [];

    for (const file of files) {
      const res = await drive.files.get(
        { fileId: file.id!, alt: "media" },
        { responseType: "stream" }
      );

      let data = "";
      for await (const chunk of res.data) {
        data += chunk;
      }

      results.push({
        id: file.id,
        name: file.name,
        content: data,
      });
    }

    return Response.json({
      success: true,
      broker,
      total: results.length,
      files: results,
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
    });
  }
}