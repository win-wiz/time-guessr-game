"use client";

import React, { memo, useState, useCallback } from "react";
import { Share2, Twitter, Facebook, MessageCircle, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Social platform configurations
const SOCIAL_PLATFORMS = {
  twitter: {
    name: "Twitter",
    icon: Twitter,
    color: "hover:bg-blue-500/20 hover:text-blue-400",
    getUrl: (text: string, url: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "hover:bg-blue-600/20 hover:text-blue-500",
    getUrl: (text: string, url: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "hover:bg-green-500/20 hover:text-green-400",
    getUrl: (text: string, url: string) => 
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
} as const;

interface ShareData {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
}

interface ShareDialogProps {
  shareData: ShareData;
  children?: React.ReactNode;
  className?: string;
}

// Memoized share button component for better performance
const ShareButton = memo<{
  platform: keyof typeof SOCIAL_PLATFORMS;
  shareText: string;
  shareUrl: string;
}>(function ShareButton({ platform, shareText, shareUrl }) {
  const config = SOCIAL_PLATFORMS[platform];
  const Icon = config.icon;
  
  const handleShare = useCallback(() => {
    const url = config.getUrl(shareText, shareUrl);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  }, [config, shareText, shareUrl]);

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleShare}
      className={cn(
        "w-full justify-start gap-3 h-12 transition-all duration-200",
        config.color
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">Share on {config.name}</span>
    </Button>
  );
});

// Memoized copy button component
const CopyButton = memo<{
  shareText: string;
  shareUrl: string;
}>(function CopyButton({ shareText, shareUrl }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(async () => {
    try {
      const textToCopy = `${shareText} ${shareUrl}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [shareText, shareUrl]);

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleCopy}
      className={cn(
        "w-full justify-start gap-3 h-12 transition-all duration-200",
        copied ? "bg-green-500/20 text-green-400" : "hover:bg-gray-500/20"
      )}
    >
      {copied ? (
        <Check className="w-5 h-5" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
      <span className="font-medium">
        {copied ? "Copied!" : "Copy Link"}
      </span>
    </Button>
  );
});

export const ShareDialog = memo<ShareDialogProps>(function ShareDialog({
  shareData,
  children,
  className
}) {
  const [open, setOpen] = useState(false);
  
  // Generate share text and URL
  const shareText = `${shareData.title} - ${shareData.description}${shareData.hashtags ? ` ${shareData.hashtags.map(tag => `#${tag}`).join(' ')}` : ''}`;
  const shareUrl = shareData.url || window.location.href;
  
  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== 'undefined' && 'share' in navigator;
  
  const handleNativeShare = useCallback(async () => {
    if (!canUseWebShare) return;
    
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareUrl,
      });
      setOpen(false);
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
    }
  }, [canUseWebShare, shareData, shareUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Result
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview of share content */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <h4 className="font-semibold text-sm mb-2">Preview:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {shareText}
            </p>
          </div>
          
          {/* Native share button (if available) */}
          {canUseWebShare && (
            <Button
              onClick={handleNativeShare}
              className="w-full gap-2 h-12"
              size="lg"
            >
              <Share2 className="w-5 h-5" />
              Share via System
            </Button>
          )}
          
          {/* Social platform buttons */}
          <div className="space-y-2">
            {Object.keys(SOCIAL_PLATFORMS).map((platform) => (
              <ShareButton
                key={platform}
                platform={platform as keyof typeof SOCIAL_PLATFORMS}
                shareText={shareText}
                shareUrl={shareUrl}
              />
            ))}
          </div>
          
          {/* Copy link button */}
          <CopyButton shareText={shareText} shareUrl={shareUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ShareDialog;