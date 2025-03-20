import { useState } from 'react';
import { Txt } from '~/cms/Txt';

interface FAQItemProps {
  questionKey: string;
  answerKey: string;
  defaultQuestion: string;
  defaultAnswer: string;
}

function FAQItem({ questionKey, answerKey, defaultQuestion, defaultAnswer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">
          <Txt k={questionKey}>{defaultQuestion}</Txt>
        </h3>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </span>
      </button>
      {isOpen && (
        <div className="mt-2">
          <p className="text-gray-600">
            <Txt k={answerKey}>{defaultAnswer}</Txt>
          </p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      questionKey: 'faq.whatIs.question',
      answerKey: 'faq.whatIs.answer',
      defaultQuestion: 'What is Mandates.io?',
      defaultAnswer:
        'Mandates.io is a platform that connects qualified investors with investment opportunities that match their specific criteria. We provide a streamlined way for family offices and institutional investors to find deals that align with their investment mandates.',
    },
    {
      questionKey: 'faq.matching.question',
      answerKey: 'faq.matching.answer',
      defaultQuestion: 'How does the matching process work?',
      defaultAnswer:
        "When an investor submits a mandate, it's added to our database (after verification). Deal sponsors can then submit opportunities that match the criteria. Our system automatically matches deals to mandates based on investment type, size, location, and other parameters.",
    },
    {
      questionKey: 'faq.confidentiality.question',
      answerKey: 'faq.confidentiality.answer',
      defaultQuestion: 'Is my information kept confidential?',
      defaultAnswer:
        'Yes, we take privacy very seriously. Mandate details are anonymized, and investor identities are only revealed when they express interest in a specific deal. You control what information is shared and when.',
    },
    {
      questionKey: 'faq.submitMandate.question',
      answerKey: 'faq.submitMandate.answer',
      defaultQuestion: 'How do I submit a mandate?',
      defaultAnswer:
        "Simply click the 'Submit Mandate' button, complete our registration process, and fill out the mandate form with your investment criteria. Once verified, your mandate will be visible to qualified deal sponsors.",
    },
    {
      questionKey: 'faq.submitDeal.question',
      answerKey: 'faq.submitDeal.answer',
      defaultQuestion: 'How do I submit a deal to a mandate?',
      defaultAnswer:
        "Browse the available mandates, find one that matches your deal, and click 'Submit a Deal' on that mandate. You'll be prompted to provide deal details to demonstrate alignment with the mandate's criteria.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            <Txt k={'faq.title'}>Frequently Asked Questions</Txt>
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                questionKey={faq.questionKey}
                answerKey={faq.answerKey}
                defaultQuestion={faq.defaultQuestion}
                defaultAnswer={faq.defaultAnswer}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
