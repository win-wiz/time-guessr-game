"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { UserPreferencesManager } from "@/lib/client-storage";
import { Settings } from "lucide-react";

interface SimplePreferencesProps {
  onSettingsChange?: () => void;
}

export function SimplePreferences({ onSettingsChange }: SimplePreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(UserPreferencesManager.loadPreferences());

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    UserPreferencesManager.savePreferences(newPreferences);
    onSettingsChange?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          设置
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>游戏设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">自动保存进度</div>
              <div className="text-sm text-muted-foreground">页面刷新时恢复游戏</div>
            </div>
            <Switch
              checked={preferences.autoSaveProgress}
              onCheckedChange={(checked) => handlePreferenceChange('autoSaveProgress', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">显示提示</div>
              <div className="text-sm text-muted-foreground">显示游戏提示信息</div>
            </div>
            <Switch
              checked={preferences.showHints}
              onCheckedChange={(checked) => handlePreferenceChange('showHints', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">音效</div>
              <div className="text-sm text-muted-foreground">启用游戏音效</div>
            </div>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}