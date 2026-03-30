import { useThemeStore, type ThemeColor } from '@/stores/themeStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeOption {
  key: ThemeColor;
  label: string;
  description: string;
  swatch: string;
  ring: string;
}

const themes: ThemeOption[] = [
  {
    key: 'default',
    label: 'Default',
    description: 'Classic neutral black & white',
    swatch: 'bg-slate-900',
    ring: 'ring-slate-900',
  },
  {
    key: 'blue',
    label: 'Ocean Blue',
    description: 'Cool calm professional blue',
    swatch: 'bg-blue-600',
    ring: 'ring-blue-600',
  },
  {
    key: 'emerald',
    label: 'Emerald',
    description: 'Fresh and nature-inspired green',
    swatch: 'bg-emerald-600',
    ring: 'ring-emerald-600',
  },
  {
    key: 'rose',
    label: 'Rose',
    description: 'Warm rose red accent',
    swatch: 'bg-rose-500',
    ring: 'ring-rose-500',
  },
  {
    key: 'amber',
    label: 'Amber',
    description: 'Energetic warm golden tone',
    swatch: 'bg-amber-500',
    ring: 'ring-amber-500',
  },
  {
    key: 'violet',
    label: 'Violet',
    description: 'Rich deep creative purple',
    swatch: 'bg-violet-600',
    ring: 'ring-violet-600',
  },
];

export default function SettingsPage() {
  const { color, setColor } = useThemeStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Configure your preferences for the OPG Central Management System"
        icon={Settings}
      />

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Palette className="w-4 h-4 text-primary" />
            Accent Color Theme
          </CardTitle>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose an accent color that will be applied across all buttons, active states, and
            interactive elements throughout the application. Changes take effect instantly.
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((theme) => {
              const isActive = color === theme.key;
              return (
                <button
                  key={theme.key}
                  onClick={() => setColor(theme.key)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-150',
                    'hover:border-slate-300 hover:bg-slate-50',
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-slate-200 bg-white'
                  )}
                >
                  {/* Color swatch */}
                  <div className={cn('w-8 h-8 rounded-full shrink-0 shadow-sm', theme.swatch, isActive && `ring-2 ring-offset-1 ${theme.ring}`)} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{theme.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{theme.description}</p>
                  </div>
                  {isActive && (
                    <Check className="absolute top-2.5 right-2.5 w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className={cn('w-6 h-6 rounded-full shrink-0', themes.find(t => t.key === color)?.swatch ?? 'bg-slate-900')} />
            <p className="text-xs text-slate-600">
              Active theme: <span className="font-semibold text-slate-800">{themes.find(t => t.key === color)?.label}</span>
              {' '}— your preference is automatically saved and will persist across sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
