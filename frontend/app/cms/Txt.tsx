import { useTxt } from '~/context/TxtContext';
import { useCurrentUser } from '~/context/UserContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';

type TxtProps = {
  k: string;
  children?: React.ReactNode;
};

export function Txt(props: TxtProps) {
  const { k } = props;
  const { txt } = useTxt();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [isHovered, setIsHovered] = useState(false);

  const isAdmin = user ? user.roles.includes('ROLE_ADMIN') : false;

  const handleEdit = () => {
    // Set this text key in session storage for quick navigation
    sessionStorage.setItem('editingTxtKey', k);

    // Get the default value, ensuring we handle JSX children properly
    let defaultValue = '';
    if (props.children) {
      // Try to get text content from children if it's string
      if (typeof props.children === 'string') {
        defaultValue = props.children;
      } else if (typeof props.children === 'number') {
        defaultValue = props.children.toString();
      }
    }

    // Save current or default value
    sessionStorage.setItem('editingTxtValue', txt[k] || defaultValue);

    // Navigate to the admin text editor
    navigate('/admin/txt');
  };

  if (isAdmin) {
    const hasCustomText = k in txt;

    return (
      <div
        suppressHydrationWarning={true}
        className={`relative inline-block group ${!hasCustomText ? 'border-b border-dashed border-gray-300' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {txt[k] && (
          <div suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: txt[k] }}></div>
        )}

        {!txt[k] && props.children}

        {/* Edit button overlay (only visible on hover) */}
        {isHovered && (
          <button
            onClick={handleEdit}
            className={`absolute top-0 right-0 transform translate-x-full -translate-y-1/4 
                      ${hasCustomText ? 'bg-blue-600' : 'bg-green-600'} text-white text-xs rounded p-1 opacity-80 hover:opacity-100 z-10`}
            title={`${hasCustomText ? 'Edit' : 'Create'} text: ${k}`}
          >
            {hasCustomText ? 'Edit' : 'Create'}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {txt[k] && (
        <div suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: txt[k] }}></div>
      )}

      {!txt[k] && props.children}
    </>
  );
}
