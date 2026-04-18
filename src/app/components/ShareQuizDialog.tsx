import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, QrCode, Mail, MessageCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';

interface ShareQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  quizTitle: string;
}

export function ShareQuizDialog({ open, onOpenChange, quizId, quizTitle }: ShareQuizDialogProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Generate the quiz URL
  const quizUrl = `${window.location.origin}/quiz/${quizId}`;

  // Generate QR Code when needed
  useEffect(() => {
    if (showQR && !qrCodeUrl) {
      setIsGeneratingQR(true);
      QRCodeLib.toDataURL(quizUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#281C59',
          light: '#ffffff',
        },
      })
        .then((url) => {
          setQrCodeUrl(url);
          setIsGeneratingQR(false);
        })
        .catch((err) => {
          console.error('QR Code generation failed:', err);
          toast.error('Failed to generate QR code');
          setIsGeneratingQR(false);
        });
    }
  }, [showQR, quizUrl, qrCodeUrl]);

  const copyToClipboard = async () => {
    try {
      // In Figma Make environment, clipboard API may be blocked, so we use fallback first
      const textArea = document.createElement('textarea');
      textArea.value = quizUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          setCopied(true);
          toast.success('Link copied to clipboard! 🎉');
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (execErr) {
        textArea.remove();
        // If execCommand fails, try modern API as last resort
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(quizUrl);
          setCopied(true);
          toast.success('Link copied to clipboard! 🎉');
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw execErr;
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Please manually select and copy the link from the field above');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Take the Quiz: ${quizTitle}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to take this quiz: ${quizTitle}\n\nClick here to start: ${quizUrl}\n\nGood luck!`
    );
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.click();
    
    toast.success('Opening email client...');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `📝 Take the Quiz: *${quizTitle}*\n\n${quizUrl}\n\nGood luck! 🍀`
    );
    const whatsappUrl = `https://wa.me/?text=${text}`;
    
    // Open in new window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    toast.success('Opening WhatsApp...');
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `quiz-${quizTitle.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR Code downloaded! 📥');
    } else {
      toast.error('QR Code not ready yet');
    }
  };

  const handleShowQR = () => {
    setShowQR(!showQR);
    if (!showQR) {
      toast.info('Generating QR Code...');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md app-panel" style={{ borderColor: 'rgba(40, 28, 89, 0.16)' }}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="app-icon-badge h-10 w-10 rounded-lg">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Share Quiz</DialogTitle>
              <DialogDescription>Share "{quizTitle}" with students</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quiz Link</label>
            <div className="flex gap-2">
              <Input value={quizUrl} readOnly className="app-input flex-1 bg-gray-50" />
              <Button
                onClick={copyToClipboard}
                className={`${
                  copied
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-[#281C59] hover:brightness-95'
                } text-white transition-all`}
              >
                {copied ? (
                  <>
                    <Check className="size-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Share Via</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="app-outline-action flex items-center gap-2"
              >
                <Mail className="size-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={shareViaWhatsApp}
                className="app-outline-action flex items-center gap-2"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">QR Code</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowQR}
                className="text-[#281C59] hover:bg-[#f4effd] hover:text-slate-900"
              >
                <QrCode className="size-4 mr-2" />
                {showQR ? 'Hide' : 'Show'} QR Code
              </Button>
            </div>

            {showQR && (
              <div className="app-soft-block rounded-lg p-4 space-y-3">
                {qrCodeUrl ? (
                  <>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-600">
                      Scan with mobile camera to open quiz
                    </p>
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="app-outline-action w-full"
                    >
                      Download QR Code
                    </Button>
                  </>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#281C59]"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="app-soft-info rounded-lg border-l-4 p-3" style={{ borderLeftColor: '#281C59' }}>
            <p className="text-xs text-slate-700">
              <span className="font-semibold">💡 Tip:</span> Students can access the quiz from any
              device using this link. No login required!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
