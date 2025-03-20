import { FormLabel } from '../form';
import { useDealSubmission } from '~/context/DealSubmissionContext';

export function DealFormStep3() {
  const { form, handleInputChange } = useDealSubmission();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">Deal Description</h2>
      <p className="text-gray-600">
        Please provide a detailed description of your deal, including background information, unique
        selling points, timeline, and use of proceeds.
      </p>

      <div>
        <FormLabel htmlFor="dealDescription" required>
          Deal Description
        </FormLabel>
        <textarea
          id="dealDescription"
          value={form.dealDescription || ''}
          onChange={handleInputChange}
          placeholder="Enter a comprehensive description of your deal..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-48"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              In the next step, you'll be able to upload supporting documents such as pitch decks,
              financial models, or other materials that help explain your deal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
