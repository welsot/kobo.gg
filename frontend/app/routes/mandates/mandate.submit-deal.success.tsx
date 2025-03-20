import { DealSubmissionSuccess } from '~/components/DealSubmission';
import { useSearchParams } from 'react-router';
import { apiGetDealById } from '~/api/apiComponents';
import { useEffect, useState } from 'react';
import type { GetDealByIdResponse } from '~/api/apiSchemas';
import { alertError } from '~/utils/form';

export default function MandateSubmitDealSuccessPage() {
  const [searchParams] = useSearchParams();

  const dealId = searchParams.get('dealId') || null;

  if (!dealId) {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GetDealByIdResponse | null>(null);

  useEffect(() => {
    if (!dealId) {
      return;
    }
    setLoading(true);
    apiGetDealById({ pathParams: { id: dealId } })
      .then(setResponse)
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dealId]);

  return (
    <div className="container mx-auto py-8">
      {loading && <div>Loading...</div>}
      {response && <DealSubmissionSuccess deal={response.deal} mandate={response.mandate} />}
    </div>
  );
}
