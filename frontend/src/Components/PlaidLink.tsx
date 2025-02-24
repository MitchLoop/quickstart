import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess, onExit }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/create_link_token', {
          method: 'POST',
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
      }
    };
    createLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(
    (publicToken: string) => {
      // Send public_token to server
      fetch('/api/set_access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
      })
        .then((response) => response.json())
        .then((data) => {
          onSuccess(publicToken);
        })
        .catch((error) => console.error('Error:', error));
    },
    [onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: (public_token, metadata) => onPlaidSuccess(public_token),
    onExit: () => onExit(),
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
};

export default PlaidLink;
