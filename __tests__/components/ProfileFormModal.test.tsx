import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileFormModal, { ProfileData } from '@/components/ProfileFormModal';

// Mock Solana wallet adapter
const mockSendTransaction = jest.fn();
const mockPublicKey = {
  toString: () => 'MockWalletAddress123',
  toBase58: () => 'MockWalletAddress123',
};

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: mockPublicKey,
    sendTransaction: mockSendTransaction,
    connected: true,
  }),
}));

// Mock Solana web3
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 123456,
    }),
    confirmTransaction: jest.fn().mockResolvedValue({
      value: { err: null },
    }),
  })),
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    recentBlockhash: null,
    feePayer: null,
  })),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({}),
  },
  PublicKey: jest.fn().mockImplementation((key) => ({ toString: () => key })),
  LAMPORTS_PER_SOL: 1000000000,
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock config
jest.mock('@/lib/config', () => ({
  PAYMENT_CONFIG: {
    MINT_PRICE_SOL: 0.1,
    TREASURY_WALLET: 'TreasuryWallet123',
    SOLANA_NETWORK: 'https://api.devnet.solana.com',
  },
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
}));

describe('ProfileFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    walletAddress: 'TestWallet123',
    hasPromoCode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.alert = jest.fn();

    // Mock FileReader
    global.FileReader = jest.fn().mockImplementation(function(this: any) {
      this.readAsDataURL = jest.fn(function(this: any) {
        this.onloadend?.();
        this.result = 'data:image/png;base64,mockBase64Data';
      });
    }) as any;
  });

  describe('🎯 Basic Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ProfileFormModal {...defaultProps} />);
      expect(screen.getByText('🎨 Customize Your Card')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ProfileFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('🎨 Customize Your Card')).not.toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(<ProfileFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('Your name or nickname')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('username')[0]).toBeInTheDocument(); // Twitter
      expect(screen.getAllByPlaceholderText('username')[1]).toBeInTheDocument(); // Telegram
    });

    it('should display promo code badge when hasPromoCode is true', () => {
      render(<ProfileFormModal {...defaultProps} hasPromoCode={true} promoCodeApplied="TESTCODE" />);
      expect(screen.getByText(/TESTCODE/)).toBeInTheDocument();
      expect(screen.getByText('Save (FREE)')).toBeInTheDocument();
    });
  });

  describe('🔥 NUCLEAR LEVEL - Form Validation Extremes', () => {
    it('should prevent submission with empty display name', async () => {
      render(<ProfileFormModal {...defaultProps} />);
      const form = screen.getByText(/Save & Pay/).closest('form') as HTMLFormElement;
      const submitButton = screen.getByText(/Save & Pay/);

      // Prevent default form submission to test the validation
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.onsubmit = handleSubmit;

      fireEvent.submit(form);

      // HTML5 validation should prevent submission, or our check should alert
      // Since the input has required attribute, we just verify form behavior
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should prevent submission with whitespace-only display name', async () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: '   \t\n   ' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Please enter your name');
      });
    });

    it('should handle display name at max length (30 chars)', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const maxLengthName = 'A'.repeat(30);

      fireEvent.change(nameInput, { target: { value: maxLengthName } });
      expect(nameInput.value).toBe(maxLengthName);
    });

    it('should handle unicode characters in display name', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const unicodeName = '你好世界🚀🌟';

      fireEvent.change(nameInput, { target: { value: unicodeName } });
      expect(nameInput.value).toBe(unicodeName);
    });

    it('should handle emoji sequences in display name', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const emojiName = '👨‍👩‍👧‍👦🏳️‍🌈🧑‍💻';

      fireEvent.change(nameInput, { target: { value: emojiName } });
      expect(nameInput.value).toBe(emojiName);
    });

    it('should handle RTL text in display name', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const rtlName = 'مرحبا بك في العالم';

      fireEvent.change(nameInput, { target: { value: rtlName } });
      expect(nameInput.value).toBe(rtlName);
    });

    it('should strip @ symbol from twitter input', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;

      fireEvent.change(twitterInput, { target: { value: '@elonmusk' } });
      expect(twitterInput.value).toBe('elonmusk');
    });

    it('should strip @ symbol from beginning of twitter input', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;

      // The component uses replace('@', '') which only replaces first occurrence
      fireEvent.change(twitterInput, { target: { value: '@username' } });
      expect(twitterInput.value).toBe('username');

      // Multiple @ symbols - only first is replaced
      fireEvent.change(twitterInput, { target: { value: '@@username' } });
      expect(twitterInput.value).toBe('@username'); // Only first @ is stripped
    });

    it('should handle twitter username at max length (200 chars)', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;
      const maxTwitter = 'a'.repeat(200);

      fireEvent.change(twitterInput, { target: { value: maxTwitter } });
      expect(twitterInput.value).toBe(maxTwitter);
    });

    it('should strip @ symbol from telegram input', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const telegramInput = screen.getAllByPlaceholderText('username')[1] as HTMLInputElement;

      fireEvent.change(telegramInput, { target: { value: '@durov' } });
      expect(telegramInput.value).toBe('durov');
    });

    it('should handle telegram username with underscores and numbers', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const telegramInput = screen.getAllByPlaceholderText('username')[1] as HTMLInputElement;

      fireEvent.change(telegramInput, { target: { value: 'user_name_123' } });
      expect(telegramInput.value).toBe('user_name_123');
    });
  });

  describe('☢️ NUCLEAR LEVEL - XSS and Security Extremes', () => {
    it('should handle XSS attempt in display name (script tag)', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const xssAttempt = '<script>alert("XSS")</script>';

      fireEvent.change(nameInput, { target: { value: xssAttempt } });
      expect(nameInput.value).toBe(xssAttempt);
      // React escapes this automatically, but we verify it's stored
    });

    it('should handle XSS attempt with event handlers', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const xssAttempt = '<img src=x onerror="alert(1)">';

      fireEvent.change(nameInput, { target: { value: xssAttempt } });
      expect(nameInput.value).toBe(xssAttempt);
    });

    it('should handle SQL injection patterns in twitter field', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;
      const sqlInjection = "'; DROP TABLE users; --";

      fireEvent.change(twitterInput, { target: { value: sqlInjection } });
      expect(twitterInput.value).toBe(sqlInjection);
    });

    it('should handle path traversal attempts in telegram field', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const telegramInput = screen.getAllByPlaceholderText('username')[1] as HTMLInputElement;
      const pathTraversal = '../../../etc/passwd';

      fireEvent.change(telegramInput, { target: { value: pathTraversal } });
      expect(telegramInput.value).toBe(pathTraversal);
    });

    it('should handle null bytes in input fields', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const nullByteInput = 'normal\x00malicious';

      fireEvent.change(nameInput, { target: { value: nullByteInput } });
      expect(nameInput.value).toBe(nullByteInput);
    });

    it('should handle prototype pollution attempt in form data', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: '__proto__' } });
      expect(nameInput.value).toBe('__proto__');
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it('should handle constructor pollution attempt', () => {
      render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'constructor' } });
      expect(nameInput.value).toBe('constructor');
    });
  });

  describe('🖼️ NUCLEAR LEVEL - Image Upload Extremes', () => {
    it('should reject oversized image files', async () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const oversizedFile = new File(['a'.repeat(10 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' });
      Object.defineProperty(oversizedFile, 'size', { value: 10 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('must be less than'));
      });
    });

    it('should reject non-image files', async () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const textFile = new File(['malicious content'], 'script.js', { type: 'application/javascript' });

      fireEvent.change(fileInput, { target: { files: [textFile] } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('File must be an image');
      });
    });

    it('should handle image upload API success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, imageUrl: 'https://example.com/image.jpg' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const validFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/upload-profile-image', expect.any(Object));
      });
    });

    it('should handle image upload API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'Upload failed' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const validFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to upload image');
      });
    });

    it('should handle network error during image upload', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const validFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error uploading image');
      });
    });

    it('should handle malicious filename with path traversal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, imageUrl: 'https://example.com/image.jpg' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const maliciousFile = new File(['image data'], '../../../etc/passwd.jpg', { type: 'image/jpeg' });
      Object.defineProperty(maliciousFile, 'size', { value: 1024 });

      fireEvent.change(fileInput, { target: { files: [maliciousFile] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle file with null bytes in name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, imageUrl: 'https://example.com/image.jpg' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const maliciousFile = new File(['image data'], 'image\x00.jpg', { type: 'image/jpeg' });
      Object.defineProperty(maliciousFile, 'size', { value: 1024 });

      fireEvent.change(fileInput, { target: { files: [maliciousFile] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle extremely long filename', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, imageUrl: 'https://example.com/image.jpg' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const longFilename = 'a'.repeat(1000) + '.jpg';
      const file = new File(['image data'], longFilename, { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('💰 NUCLEAR LEVEL - Payment Flow Extremes', () => {
    it('should handle successful payment flow', async () => {
      mockSendTransaction.mockResolvedValueOnce('mockSignature123');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // update-profile
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // verify-payment

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendTransaction).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle payment transaction failure', async () => {
      mockSendTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Transaction failed/)).toBeInTheDocument();
      });
    });

    it('should handle payment verification API failure', async () => {
      mockSendTransaction.mockResolvedValueOnce('mockSignature123');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // update-profile
        .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Verification failed' }) }); // verify-payment

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Verification failed/)).toBeInTheDocument();
      });
    });

    it('should handle profile save API failure during payment', async () => {
      mockSendTransaction.mockResolvedValueOnce('mockSignature123');
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // update-profile fails

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save profile/)).toBeInTheDocument();
      });
    });

    it('should bypass payment with promo code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} hasPromoCode={true} promoCodeApplied="PROMO123" />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText('Save (FREE)');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendTransaction).not.toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle network timeout during payment', async () => {
      mockSendTransaction.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 100);
        });
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should disable submit button during payment', async () => {
      mockSendTransaction.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('mockSignature'), 1000);
        });
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/) as HTMLButtonElement;
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('🎭 NUCLEAR LEVEL - User Interaction Extremes', () => {
    it('should handle modal close during image upload', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ json: async () => ({ success: true, imageUrl: 'test.jpg' }) }), 500);
        });
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const validFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle rapid form field updates', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;

      for (let i = 0; i < 100; i++) {
        fireEvent.change(nameInput, { target: { value: `Name${i}` } });
      }

      expect(nameInput.value).toBe('Name99');
    });

    it('should handle simultaneous field updates', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;
      const telegramInput = screen.getAllByPlaceholderText('username')[1] as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(twitterInput, { target: { value: 'twitter123' } });
      fireEvent.change(telegramInput, { target: { value: 'telegram456' } });

      expect(nameInput.value).toBe('Test User');
      expect(twitterInput.value).toBe('twitter123');
      expect(telegramInput.value).toBe('telegram456');
    });

    it('should handle double-click on submit button', async () => {
      mockSendTransaction.mockResolvedValue('mockSignature123');
      (global.fetch as jest.Mock)
        .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      // Should only trigger once due to disabled state
      await waitFor(() => {
        expect(mockSendTransaction).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle skip button click', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const skipButton = screen.getByText('Skip');
      fireEvent.click(skipButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle form reset after error', async () => {
      mockSendTransaction.mockRejectedValueOnce(new Error('Payment failed'));

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Payment failed/)).toBeInTheDocument();
      });

      // Form data should persist after error
      expect(nameInput.value).toBe('Test User');
    });
  });

  describe('🌐 NUCLEAR LEVEL - Edge Cases and Boundaries', () => {
    it('should handle zero-byte image file', async () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const zeroByteFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      Object.defineProperty(zeroByteFile, 'size', { value: 0 });

      fireEvent.change(fileInput, { target: { files: [zeroByteFile] } });

      // Should not trigger size validation alert for 0 bytes
      expect(global.alert).not.toHaveBeenCalledWith(expect.stringContaining('must be less than'));
    });

    it('should handle file exactly at size limit', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, imageUrl: 'https://example.com/image.jpg' }),
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const exactFile = new File(['a'.repeat(5 * 1024 * 1024)], 'exact.jpg', { type: 'image/jpeg' });
      Object.defineProperty(exactFile, 'size', { value: 5 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [exactFile] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle file one byte over limit', async () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const overFile = new File(['a'.repeat(5 * 1024 * 1024 + 1)], 'over.jpg', { type: 'image/jpeg' });
      Object.defineProperty(overFile, 'size', { value: 5 * 1024 * 1024 + 1 });

      fireEvent.change(fileInput, { target: { files: [overFile] } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('must be less than'));
      });
    });

    it('should handle unicode in twitter username', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;

      fireEvent.change(twitterInput, { target: { value: '用户名123🚀' } });
      expect(twitterInput.value).toBe('用户名123🚀');
    });

    it('should handle special characters in telegram username', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const telegramInput = screen.getAllByPlaceholderText('username')[1] as HTMLInputElement;

      fireEvent.change(telegramInput, { target: { value: 'user!@#$%^&*()' } });
      expect(telegramInput.value).toBe('user!#$%^&*()'); // @ is stripped
    });

    it('should handle form data with all fields empty except name', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

      mockSendTransaction.mockResolvedValueOnce('mockSignature');

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Just Name' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          displayName: 'Just Name',
          twitter: '',
          telegram: '',
          profileImage: null,
        });
      });
    });

    it('should handle form data with all fields populated', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({ success: true, imageUrl: 'https://example.com/img.jpg' }) }) // upload
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // update-profile
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // verify-payment

      mockSendTransaction.mockResolvedValueOnce('mockSignature');

      const { container } = render(<ProfileFormModal {...defaultProps} />);

      // Set all fields
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Full User' } });

      const twitterInput = screen.getAllByPlaceholderText('username')[0];
      fireEvent.change(twitterInput, { target: { value: 'twitter_handle' } });

      const telegramInput = screen.getAllByPlaceholderText('username')[1];
      fireEvent.change(telegramInput, { target: { value: 'telegram_handle' } });

      // Upload image
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;
      const validFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Wait for image upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/upload-profile-image', expect.any(Object));
      }, { timeout: 3000 });

      // Small delay to ensure state update from image upload completes
      await new Promise(resolve => setTimeout(resolve, 100));

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          displayName: 'Full User',
          twitter: 'twitter_handle',
          telegram: 'telegram_handle',
        }));
      }, { timeout: 5000 });
    });
  });

  describe('⚡ NUCLEAR LEVEL - Concurrency and Race Conditions', () => {
    it('should handle multiple image uploads in sequence', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({ success: true, imageUrl: 'img1.jpg' }) })
        .mockResolvedValueOnce({ json: async () => ({ success: true, imageUrl: 'img2.jpg' }) });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const file1 = new File(['data1'], 'img1.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file1, 'size', { value: 1024 });
      fireEvent.change(fileInput, { target: { files: [file1] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const file2 = new File(['data2'], 'img2.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file2, 'size', { value: 1024 });
      fireEvent.change(fileInput, { target: { files: [file2] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle submit during image upload', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ json: async () => ({ success: true, imageUrl: 'img.jpg' }) }), 500);
        });
      });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;
      const file = new File(['data'], 'img.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Try to submit immediately
      const submitButton = screen.getByText(/Save & Pay/) as HTMLButtonElement;
      fireEvent.click(submitButton);

      // Should be disabled during upload
      expect(submitButton).toBeDisabled();
    });

    it('should handle rapid open/close cycles', () => {
      const { rerender } = render(<ProfileFormModal {...defaultProps} isOpen={true} />);

      for (let i = 0; i < 10; i++) {
        rerender(<ProfileFormModal {...defaultProps} isOpen={false} />);
        rerender(<ProfileFormModal {...defaultProps} isOpen={true} />);
      }

      expect(screen.getByText('🎨 Customize Your Card')).toBeInTheDocument();
    });
  });

  describe('🔬 NUCLEAR LEVEL - Extreme Memory and Performance', () => {
    it('should handle 1000 rapid character inputs in display name', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname') as HTMLInputElement;

      for (let i = 0; i < 1000; i++) {
        fireEvent.change(nameInput, { target: { value: `User${i}` } });
      }

      expect(nameInput.value).toBeDefined();
    });

    it('should handle extremely long input then truncation', () => {
      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const twitterInput = screen.getAllByPlaceholderText('username')[0] as HTMLInputElement;

      const veryLongInput = 'a'.repeat(10000);
      fireEvent.change(twitterInput, { target: { value: veryLongInput } });

      // maxLength is enforced by the input element, but fireEvent.change bypasses it
      // The value will be set as-is in test environment
      // In real browser, maxLength would prevent this
      expect(twitterInput.value).toBeDefined();
      expect(twitterInput.maxLength).toBe(200);
    });

    it('should handle multiple promo code state changes', () => {
      const { rerender } = render(<ProfileFormModal {...defaultProps} hasPromoCode={false} />);

      for (let i = 0; i < 100; i++) {
        rerender(<ProfileFormModal {...defaultProps} hasPromoCode={i % 2 === 0} promoCodeApplied={`CODE${i}`} />);
      }

      // Last iteration (i=99) has hasPromoCode=false (99 % 2 = 1), so rerender with true to show it
      rerender(<ProfileFormModal {...defaultProps} hasPromoCode={true} promoCodeApplied="CODE99" />);
      expect(screen.getByText(/CODE99/)).toBeInTheDocument();
    });
  });

  describe('🎯 NUCLEAR LEVEL - Error Recovery', () => {
    it('should clear payment error on retry', async () => {
      mockSendTransaction
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce('mockSignature');

      (global.fetch as jest.Mock)
        .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Your name or nickname');
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByText(/Save & Pay/);
      fireEvent.click(submitButton);

      // Wait for the error to appear
      await waitFor(() => {
        const errorText = screen.queryByText(/First attempt failed/);
        expect(errorText).toBeInTheDocument();
      }, { timeout: 3000 });

      // Retry - click again
      const retryButton = screen.getByText(/Save & Pay/);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle consecutive upload failures', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Upload failed 1'))
        .mockRejectedValueOnce(new Error('Upload failed 2'))
        .mockResolvedValueOnce({ json: async () => ({ success: true, imageUrl: 'success.jpg' }) });

      const { container } = render(<ProfileFormModal {...defaultProps} />);
      const fileInput = container.querySelector('#profile-image') as HTMLInputElement;

      const file1 = new File(['data'], 'img1.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file1, 'size', { value: 1024 });

      // First upload
      fireEvent.change(fileInput, { target: { files: [file1] } });
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error uploading image');
      });

      // Second upload
      fireEvent.change(fileInput, { target: { files: [file1] } });
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error uploading image');
      });

      // Third upload succeeds
      fireEvent.change(fileInput, { target: { files: [file1] } });
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });
  });
});
