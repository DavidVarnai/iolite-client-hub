

## Plan: Fix PDF/DOCX Upload — Add Real Text Extraction

**Problem**: Uploading a PDF/DOCX stores only the filename as metadata. No text is extracted, so "Extract Insights" has nothing to work with. The user sees a warning to paste content manually — the upload is effectively non-functional for binary files.

**Solution**: Create a new edge function `parse-document` that accepts a base64-encoded file and uses Gemini's multimodal capability to extract the text content. Update the client-side upload handler to send binary files to this function and populate `rawText` with the result.

### 1. New Edge Function: `supabase/functions/parse-document/index.ts`

- Accepts `{ fileBase64: string, fileName: string, mimeType: string }`
- Sends the file as a base64 data part to `google/gemini-2.5-flash` via the Lovable AI gateway
- System prompt: "Extract all text content from this document, preserving structure (headings, paragraphs, lists). Return plain text only."
- Returns `{ text: string, pageCount?: number }`
- Handles errors gracefully with clear messages

### 2. Update `MasterBriefSection.tsx` — `handleFileUpload`

For PDF/DOCX files:
- Read the file as base64 via `FileReader`
- Show a loading state ("Extracting text from PDF…")
- Call the `parse-document` edge function
- On success: populate `rawText` and `uploadedFileContent` with extracted text, set `extractionSourceType` to the file type
- On failure: show error message, keep the metadata-only fallback with the existing warning
- Remove the binary-upload warning once text is successfully extracted

### 3. UI Changes (minimal)

- Add a brief loading indicator during PDF parsing (reuse existing Loader2 pattern)
- Show extracted character count after successful parse
- Keep the existing manual paste fallback if parsing fails

### Files

| File | Action |
|------|--------|
| `supabase/functions/parse-document/index.ts` | **Create** — multimodal AI text extraction |
| `src/components/client/discovery/MasterBriefSection.tsx` | Edit `handleFileUpload` for binary files |

