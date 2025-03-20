import { FormCheckbox } from '~/components/form';

type InvestorRegistrationStep3Props = {
  form: any;
  handleFieldUpdate: (fieldId: string, value: any) => void;
};

export function InvestorRegistrationStep3({
  form,
  handleFieldUpdate,
}: InvestorRegistrationStep3Props) {
  const handleCheckboxChange = (id: string) => (checked: boolean) => {
    handleFieldUpdate(id, checked);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Terms and Acknowledgements</h2>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-900">No Alternative Use Acknowledgement</h3>
        <p className="mt-1 text-sm text-gray-600">
          By accessing or using this platform, you acknowledge and agree that it is intended
          exclusively for legitimate deal flow between verified investors and qualified deal
          sponsors. Any attempt to use the platform for alternative purposes—including, but not
          limited to, pitching unrelated services, soliciting members, or otherwise misrepresenting
          your role—will be considered a material violation of these Terms.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          If we determine, at our sole discretion, that you have engaged in prohibited behavior or
          misuse (for example, offering services to parties unrelated to an investment), we reserve
          the right to immediately suspend or terminate your account without prior notice and to
          pursue any other remedies available under applicable law.
        </p>
        <div className="mt-3">
          <FormCheckbox
            id="acceptedNoAlternativeUse"
            label="I acknowledge and agree to never use the information I receive for any purpose other than contemplating making LP investments."
            required
            checked={form.acceptedNoAlternativeUse}
            onChange={handleCheckboxChange('acceptedNoAlternativeUse')}
          />
        </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-900">Risk Acknowledgement</h3>
        <p className="mt-1 text-sm text-gray-600">
          The deals you receive through this platform are not vetted beyond verifying— to the best
          of our ability— that they match the investment criteria you have selected. You bear full
          responsibility for conducting your own thorough due diligence on any deal before
          investing.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Nothing in our communication or on this platform constitutes an endorsement or
          recommendation. For instance, if you receive a deck citing a 15% IRR simply because you
          indicated a preference for opportunities with a minimum of 13% IRR, it does not imply the
          15% IRR is accurate or worthy of investment.
        </p>
        <div className="mt-3">
          <FormCheckbox
            id="acceptedRiskAcknowledgement"
            label="I acknowledge the risk statements above."
            required
            checked={form.acceptedRiskAcknowledgement}
            onChange={handleCheckboxChange('acceptedRiskAcknowledgement')}
          />
        </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-900">Legal Acknowledgment</h3>
        <p className="mt-1 text-sm text-gray-600">
          By participating in Mandates.io and receiving information about investment opportunities
          ("Deals"), you ("Limited Partner" or "Investor") agree to the terms and conditions
          including No Endorsement or Advice, Due Diligence Responsibility, No Guarantee of Return,
          Indemnification, and Confidentiality of Communications.
        </p>
        <div className="mt-3">
          <FormCheckbox
            id="acceptedLegalAcknowledgement"
            label="I accept the terms and conditions in full."
            required
            checked={form.acceptedLegalAcknowledgement}
            onChange={handleCheckboxChange('acceptedLegalAcknowledgement')}
          />
        </div>
      </div>
    </div>
  );
}
