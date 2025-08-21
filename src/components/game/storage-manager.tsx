"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  GameProgressManager,
  PlayerSettingsManager,
  GameHistoryManager,
  PlayerStatsManager,
  checkStorageSpace,
  exportGameData,
  importGameData
} from "@/lib/local-storage";
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  BarChart3,
  HardDrive,
  AlertTriangle
} from "lucide-react";

interface StorageManagerProps {
  onSettingsChange?: () => void;
}

export function StorageManager({ onSettingsChange }: StorageManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ hasSpace: true, usage: 0, warning: false });
  const [settings, setSettings] = useState(PlayerSettingsManager.loadSettings());
  const [stats, setStats] = useState(PlayerStatsManager.loadStats());
  const [hasProgress, setHasProgress] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // 更新存储信息
  const updateStorageInfo = () => {
    const info = checkStorageSpace();
    setStorageInfo(info);
    setHasProgress(GameProgressManager.hasProgress());
    setHistoryCount(GameHistoryManager.loadHistory().length);
    setStats(PlayerStatsManager.loadStats());
  };

  useEffect(() => {
    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, []);

  // 处理设置更改
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    PlayerSettingsManager.saveSettings(newSettings);
    onSettingsChange?.();
  };

  // 导出数据
  const handleExportData = () => {
    try {
      const data = exportGameData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-guessr-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入数据
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = importGameData(data);
        if (success) {
          alert('数据导入成功！');
          updateStorageInfo();
          setSettings(PlayerSettingsManager.loadSettings());
        } else {
          alert('数据导入失败，请检查文件格式');
        }
      } catch (error) {
        alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
      }
    };
    reader.readAsText(file);
    
    // 重置input值，允许重复选择同一文件
    event.target.value = '';
  };

  // 清除所有数据
  const handleClearAllData = () => {
    GameProgressManager.clearProgress();
    GameHistoryManager.clearHistory();
    PlayerStatsManager.resetStats();
    PlayerSettingsManager.resetSettings();
    setSettings(PlayerSettingsManager.loadSettings());
    updateStorageInfo();
    onSettingsChange?.();
  };

  // 清除游戏进度
  const handleClearProgress = () => {
    GameProgressManager.clearProgress();
    updateStorageInfo();
  };

  // 清除历史记录
  const handleClearHistory = () => {
    GameHistoryManager.clearHistory();
    updateStorageInfo();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Settings className="w-4 h-4 mr-2" />
          存储管理
          {storageInfo.warning && (
            <AlertTriangle className="w-3 h-3 ml-1 text-yellow-500" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            本地存储管理
          </DialogTitle>
          <DialogDescription>
            管理游戏数据、设置和存储空间
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 存储空间状态 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                存储空间使用情况
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>已使用空间</span>
                <span>{storageInfo.usage.toFixed(1)}%</span>
              </div>
              <Progress value={storageInfo.usage} className="h-2" />
              {storageInfo.warning && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  存储空间不足，建议清理数据
                </div>
              )}
            </CardContent>
          </Card>

          {/* 游戏设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                游戏设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">自动保存</div>
                  <div className="text-xs text-muted-foreground">自动保存游戏进度</div>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">显示提示</div>
                  <div className="text-xs text-muted-foreground">显示游戏提示信息</div>
                </div>
                <Switch
                  checked={settings.showHints}
                  onCheckedChange={(checked) => handleSettingChange('showHints', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">音效</div>
                  <div className="text-xs text-muted-foreground">启用游戏音效</div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 数据统计 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                数据统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">总游戏数</div>
                  <div className="font-medium">{stats.totalGames}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">最高分</div>
                  <div className="font-medium">{stats.bestScore}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">历史记录</div>
                  <div className="font-medium">{historyCount} 条</div>
                </div>
                <div>
                  <div className="text-muted-foreground">保存的进度</div>
                  <div className="font-medium">
                    {hasProgress ? (
                      <Badge variant="secondary">有</Badge>
                    ) : (
                      <Badge variant="outline">无</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据管理操作 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">数据管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出数据
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  导入数据
                </Button>
                
                {hasProgress && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        清除进度
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认清除游戏进度</AlertDialogTitle>
                        <AlertDialogDescription>
                          这将删除当前保存的游戏进度，此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearProgress}>
                          确认清除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {historyCount > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        清除历史
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认清除游戏历史</AlertDialogTitle>
                        <AlertDialogDescription>
                          这将删除所有游戏历史记录，此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory}>
                          确认清除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    清除所有数据
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认清除所有数据</AlertDialogTitle>
                    <AlertDialogDescription>
                      这将删除所有游戏数据，包括设置、历史记录、统计信息和保存的进度。此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData}>
                      确认清除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}