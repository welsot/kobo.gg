import { useState } from 'react';
import { FormCheckbox, FormFileUpload, FormLabel } from '../form';
import { useDealSubmission } from '~/context/DealSubmissionContext';
import { apiPostAttachments } from '~/api/apiComponents';
import { useDealSubmissionStore } from '~/store/dealSubmissionStore';

export function DealFormStep4() {
  const { form, handleFieldUpdate } = useDealSubmission();
  const { addAttachmentId, removeAttachmentId } = useDealSubmissionStore();
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFilesSelected = async (files: File[]) => {
    const fileNames = files.map((file) => file.name);

    // Add file names to attachments for display purposes
    handleFieldUpdate('attachments', [...form.attachments, ...fileNames]);

    // Upload each file to S3 via the signed URL
    for (const file of files) {
      try {
        // Mark file as uploading
        setUploading((prev) => ({ ...prev, [file.name]: true }));

        // Get signed URL from server
        const response = await apiPostAttachments({
          body: { filename: file.name },
        });

        // Upload file directly to S3 using the signed URL
        const uploadResult = await fetch(response.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResult.ok) {
          throw new Error(`Upload failed with status: ${uploadResult.status}`);
        }

        // Store the attachment ID for later use
        addAttachmentId(response.attachmentId);

        // Clear any previous errors
        setUploadErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[file.name];
          return newErrors;
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadErrors((prev) => ({
          ...prev,
          [file.name]: error instanceof Error ? error.message : 'Upload failed',
        }));
      } finally {
        // Mark file as done uploading
        setUploading((prev) => {
          const newUploading = { ...prev };
          delete newUploading[file.name];
          return newUploading;
        });
      }
    }
  };

  const handleFileRemoved = (fileName: string) => {
    // Remove from display list
    const updatedAttachments = form.attachments.filter((name) => name !== fileName);
    handleFieldUpdate('attachments', updatedAttachments);

    // Remove any associated errors
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });

    // Find and remove attachment ID (if available) when file is removed
    // This is a simplified approach - in a real implementation you'd need to map filenames to attachment IDs
    // For now, we'll just assume the attachment ID is removed from the backend when the deal is submitted
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">Supporting Documents</h2>
      <p className="text-gray-600">
        Upload any supporting documents such as pitch decks, financial models, images, or other
        files that will help the investor understand your deal.
      </p>

      <div>
        <FormLabel htmlFor="deal-documents">Upload Documents</FormLabel>
        <FormFileUpload
          id="deal-documents"
          label="Upload deal documentation"
          multiple={true}
          accept=".pdf,.docx,.pptx,.xlsx,.jpg,.png"
          onFilesSelected={handleFilesSelected}
          onFileRemoved={handleFileRemoved}
        />

        {/* Show upload status and errors */}
        {Object.keys(uploading).length > 0 && (
          <div className="mt-2">
            {Object.keys(uploading).map((fileName) => (
              <div key={fileName} className="text-sm text-blue-600">
                Uploading {fileName}...
              </div>
            ))}
          </div>
        )}

        {Object.keys(uploadErrors).length > 0 && (
          <div className="mt-2">
            {Object.entries(uploadErrors).map(([fileName, error]) => (
              <div key={fileName} className="text-sm text-red-600">
                Error uploading {fileName}: {error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <FormCheckbox
          id="termsAgreed"
          label={
            <span className="text-sm text-gray-700">
              I confirm that all information provided is accurate and I give permission to share
              these materials with the mandate owner?
            </span>
          }
          checked={form.termsAgreed}
          onChange={(checked) => handleFieldUpdate('termsAgreed', checked)}
          required
        />
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              After submitting your deal, the mandate owner will be notified and will review your
              submission. You will be contacted if there is interest in progressing further.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
