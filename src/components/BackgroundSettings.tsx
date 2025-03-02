import React from 'react';
import { BackgroundSettings } from '../types/Todo';

const PRESET_BACKGROUNDS = {
  waves: 'radial-gradient(circle at 100%, #333, #333 50%, #eee 75%, #333 75%)',
  geometric: 'linear-gradient(45deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)',
  sunset: 'linear-gradient(to right, #ff512f, #f09819)',
  ocean: 'linear-gradient(to left, #4facfe 0%, #00f2fe 100%)',
  forest: 'linear-gradient(to right, #134e5e, #71b280)',
  night: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
};

const PATTERNS = {
  dots: 'radial-gradient(#000 1px, transparent 1px)',
  grid: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
  stripes: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
};

interface BackgroundSettingsProps {
  settings: BackgroundSettings;
  onUpdate: (settings: BackgroundSettings) => void;
}

const BackgroundSettingsComponent: React.FC<BackgroundSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handleTypeChange = (type: BackgroundSettings['type']) => {
    const newSettings: BackgroundSettings = {
      ...settings,
      type,
      preset: type === 'preset' ? 'waves' : undefined,
      gradient: type === 'gradient' ? { colors: ['#4facfe', '#00f2fe'], angle: 90 } : undefined,
      pattern: type === 'pattern' ? 'dots' : undefined,
      imageUrl: type === 'image' ? '' : undefined,
    };
    onUpdate(newSettings);
  };

  const handlePresetChange = (preset: string) => {
    onUpdate({ ...settings, preset });
  };

  const handlePatternChange = (pattern: string) => {
    onUpdate({ ...settings, pattern });
  };

  const handleOpacityChange = (opacity: number) => {
    onUpdate({ ...settings, opacity });
  };

  const handleImageUrlChange = (imageUrl: string) => {
    onUpdate({ ...settings, imageUrl });
  };

  const handleGradientChange = (colors: string[], angle: number) => {
    onUpdate({
      ...settings,
      gradient: { colors, angle },
    });
  };

  return (
    <div className="background-settings">
      <div className="setting-group">
        <label>Background Type:</label>
        <select
          value={settings.type}
          onChange={(e) => handleTypeChange(e.target.value as BackgroundSettings['type'])}
        >
          <option value="preset">Preset</option>
          <option value="gradient">Gradient</option>
          <option value="pattern">Pattern</option>
          <option value="image">Custom Image</option>
        </select>
      </div>

      {settings.type === 'preset' && (
        <div className="setting-group">
          <label>Preset Style:</label>
          <select
            value={settings.preset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            {Object.keys(PRESET_BACKGROUNDS).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {settings.type === 'pattern' && (
        <div className="setting-group">
          <label>Pattern Style:</label>
          <select
            value={settings.pattern}
            onChange={(e) => handlePatternChange(e.target.value)}
          >
            {Object.keys(PATTERNS).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {settings.type === 'gradient' && settings.gradient && (
        <div className="setting-group">
          <label>Gradient Colors:</label>
          <div className="gradient-colors">
            {settings.gradient.colors.map((color, index) => (
              <input
                key={index}
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...settings.gradient!.colors];
                  newColors[index] = e.target.value;
                  handleGradientChange(newColors, settings.gradient!.angle);
                }}
              />
            ))}
          </div>
          <label>Angle:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={settings.gradient?.angle ?? 90}
            onChange={(e) => {
              if (settings.gradient) {
                handleGradientChange(settings.gradient.colors, parseInt(e.target.value));
              }
            }}
          />
        </div>
      )}

      {settings.type === 'image' && (
        <div className="setting-group">
          <label>Image URL:</label>
          <input
            type="text"
            value={settings.imageUrl || ''}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="Enter image URL"
          />
        </div>
      )}

      <div className="setting-group">
        <label>Opacity: {settings.opacity}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.opacity}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export { BackgroundSettingsComponent, PRESET_BACKGROUNDS, PATTERNS };
export type { BackgroundSettingsProps }; 