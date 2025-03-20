import { FormInput, FormLabel, FormSelect } from '../form';
import { useDealSubmission } from '~/context/DealSubmissionContext';

export function DealFormStep1() {
  const { form, handleInputChange, handleSelectChange, ownerTypeOptions } = useDealSubmission();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">Deal Owner Information</h2>
      <p className="text-gray-600">
        Please provide information about the person or entity submitting this deal.
      </p>

      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="contactInfo.name" required>
            Name
          </FormLabel>
          <FormInput
            id="contactInfo.name"
            type="text"
            required
            value={form.contactInfo.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <FormLabel htmlFor="contactInfo.email" required>
            Email
          </FormLabel>
          <FormInput
            id="contactInfo.email"
            type="email"
            required
            value={form.contactInfo.email || ''}
            onChange={handleInputChange}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <FormLabel htmlFor="contactInfo.phone">Phone Number</FormLabel>
          <FormInput
            id="contactInfo.phone"
            type="tel"
            value={form.contactInfo.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <FormLabel htmlFor="contactInfo.type" required>
            Role Type
          </FormLabel>
          <FormSelect
            id="contactInfo.type"
            options={ownerTypeOptions}
            value={form.contactInfo.type || ''}
            onChange={(value) => handleSelectChange('contactInfo.type', value)}
            placeholder="Select your role"
            required
          />
        </div>
      </div>
    </div>
  );
}
