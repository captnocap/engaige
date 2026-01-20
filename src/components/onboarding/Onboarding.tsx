import { useState } from 'react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  provider: {
    type: 'openai' | 'openai-compatible' | 'anthropic';
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };
  budget: {
    overall_limit_cents: number;
    period_type: 'daily' | 'weekly' | 'monthly';
    rollover_enabled: boolean;
  };
  profile: {
    username: string;
    display_name?: string;
    bio?: string;
    interests: string[];
    personality_vibe: string;
  };
  preferences: {
    romantic_interest_level: 'none' | 'low' | 'medium' | 'high';
    platonic_friends_level: 'low' | 'medium' | 'high';
    npc_count: number;
    npc_gender_preference: 'any' | 'male' | 'female' | 'mixed';
    age_range_preference: { min: number; max: number };
  };
  skip_npc_generation?: boolean;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    provider: {
      type: 'openai-compatible',
      model: 'gpt-4o-mini',
      baseUrl: 'http://localhost:1234/v1',
    },
    budget: {
      overall_limit_cents: 1000,
      period_type: 'monthly',
      rollover_enabled: true,
    },
    profile: {
      username: '',
      interests: [],
      personality_vibe: 'chill',
    },
    preferences: {
      romantic_interest_level: 'medium',
      platonic_friends_level: 'medium',
      npc_count: 30,
      npc_gender_preference: 'mixed',
      age_range_preference: { min: 20, max: 35 },
    },
    skip_npc_generation: false,
  });

  const handleDevMode = () => {
    const devData: OnboardingData = {
      ...data,
      profile: {
        username: 'dev_user',
        display_name: 'Dev User',
        bio: 'Testing the system',
        interests: ['coding', 'gaming', 'music'],
        personality_vibe: 'chill',
      },
      skip_npc_generation: true,
    };
    onComplete(devData);
  };

  const handleNext = () => {
    if (step === 4) {
      onComplete(data);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Welcome to Love AI</h1>
        <p style={{ color: 'var(--color-textMuted)' }}>Let's set up your experience</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded"
              style={{ background: s <= step ? 'var(--color-primary)' : 'var(--color-border)' }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && <Step1Provider data={data} setData={setData} />}
        {step === 2 && <Step2Budget data={data} setData={setData} />}
        {step === 3 && <Step3Profile data={data} setData={setData} />}
        {step === 4 && <Step4Preferences data={data} setData={setData} />}
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleDevMode}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{ background: 'var(--color-accent)', color: 'var(--color-text)' }}
        >
          🚀 DEV MODE (Skip)
        </button>
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 rounded font-medium transition-colors"
              style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded font-medium transition-colors"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}
          >
            {step === 4 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step1Provider({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">AI Provider Configuration</h2>
        <p className="text-[#888]">Choose your AI provider and model</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Provider Type</label>
        <select
          value={data.provider.type}
          onChange={(e) =>
            setData({
              ...data,
              provider: { ...data.provider, type: e.target.value as any },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="openai-compatible">OpenAI-Compatible (LM Studio, etc.)</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      {data.provider.type === 'openai-compatible' && (
        <div>
          <label className="block text-sm font-medium mb-2">Base URL</label>
          <input
            type="text"
            value={data.provider.baseUrl || ''}
            onChange={(e) =>
              setData({
                ...data,
                provider: { ...data.provider, baseUrl: e.target.value },
              })
            }
            placeholder="http://localhost:1234/v1"
            className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Model Name</label>
        <input
          type="text"
          value={data.provider.model}
          onChange={(e) =>
            setData({
              ...data,
              provider: { ...data.provider, model: e.target.value },
            })
          }
          placeholder="gpt-4o-mini"
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {(data.provider.type === 'openai' || data.provider.type === 'anthropic') && (
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={data.provider.apiKey || ''}
            onChange={(e) =>
              setData({
                ...data,
                provider: { ...data.provider, apiKey: e.target.value },
              })
            }
            placeholder="sk-..."
            className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-sm text-blue-400">
          💡 For local testing, use OpenAI-Compatible with LM Studio or similar
        </p>
      </div>
    </div>
  );
}

function Step2Budget({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const dollars = data.budget.overall_limit_cents / 100;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Budget Configuration</h2>
        <p className="text-[#888]">Set your AI spending limits</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Overall Budget: ${dollars.toFixed(2)}
        </label>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={data.budget.overall_limit_cents}
          onChange={(e) =>
            setData({
              ...data,
              budget: { ...data.budget, overall_limit_cents: parseInt(e.target.value) },
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[#666] mt-1">
          <span>$1</span>
          <span>$100</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Budget Period</label>
        <select
          value={data.budget.period_type}
          onChange={(e) =>
            setData({
              ...data,
              budget: { ...data.budget, period_type: e.target.value as any },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="rollover"
          checked={data.budget.rollover_enabled}
          onChange={(e) =>
            setData({
              ...data,
              budget: { ...data.budget, rollover_enabled: e.target.checked },
            })
          }
          className="w-4 h-4"
        />
        <label htmlFor="rollover" className="text-sm">
          Enable budget rollover (unused budget carries over)
        </label>
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
        <p className="text-sm text-green-400">
          💰 Recommended: Start with $10-20/month for testing
        </p>
      </div>
    </div>
  );
}

function Step3Profile({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const [interestInput, setInterestInput] = useState('');

  const addInterest = () => {
    if (interestInput.trim() && !data.profile.interests.includes(interestInput.trim())) {
      setData({
        ...data,
        profile: {
          ...data.profile,
          interests: [...data.profile.interests, interestInput.trim()],
        },
      });
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setData({
      ...data,
      profile: {
        ...data.profile,
        interests: data.profile.interests.filter((i) => i !== interest),
      },
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Your Profile</h2>
        <p className="text-[#888]">Tell us about yourself</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Username</label>
        <input
          type="text"
          value={data.profile.username}
          onChange={(e) =>
            setData({
              ...data,
              profile: { ...data.profile, username: e.target.value },
            })
          }
          placeholder="cooluser123"
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Display Name (optional)</label>
        <input
          type="text"
          value={data.profile.display_name || ''}
          onChange={(e) =>
            setData({
              ...data,
              profile: { ...data.profile, display_name: e.target.value },
            })
          }
          placeholder="Cool User"
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio (optional)</label>
        <textarea
          value={data.profile.bio || ''}
          onChange={(e) =>
            setData({
              ...data,
              profile: { ...data.profile, bio: e.target.value },
            })
          }
          placeholder="Tell NPCs about yourself..."
          rows={3}
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Interests</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addInterest()}
            placeholder="Add an interest..."
            className="flex-1 px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addInterest}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {data.profile.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 bg-[#333] rounded-full text-sm flex items-center gap-2"
            >
              {interest}
              <button onClick={() => removeInterest(interest)} className="text-red-400">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Personality Vibe</label>
        <select
          value={data.profile.personality_vibe}
          onChange={(e) =>
            setData({
              ...data,
              profile: { ...data.profile, personality_vibe: e.target.value },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="chill">Chill & Laid Back</option>
          <option value="adventurous">Adventurous</option>
          <option value="intellectual">Intellectual</option>
          <option value="party">Party Person</option>
          <option value="romantic">Romantic</option>
          <option value="mysterious">Mysterious</option>
        </select>
      </div>
    </div>
  );
}

function Step4Preferences({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">NPC Preferences</h2>
        <p className="text-[#888]">Customize your experience</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Romantic Interest Level</label>
        <select
          value={data.preferences.romantic_interest_level}
          onChange={(e) =>
            setData({
              ...data,
              preferences: { ...data.preferences, romantic_interest_level: e.target.value as any },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="none">None</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Platonic Friends Level</label>
        <select
          value={data.preferences.platonic_friends_level}
          onChange={(e) =>
            setData({
              ...data,
              preferences: { ...data.preferences, platonic_friends_level: e.target.value as any },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Initial NPC Count: {data.preferences.npc_count}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={data.preferences.npc_count}
          onChange={(e) =>
            setData({
              ...data,
              preferences: { ...data.preferences, npc_count: parseInt(e.target.value) },
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[#666] mt-1">
          <span>5 NPCs</span>
          <span>50 NPCs</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Gender Preference</label>
        <select
          value={data.preferences.npc_gender_preference}
          onChange={(e) =>
            setData({
              ...data,
              preferences: { ...data.preferences, npc_gender_preference: e.target.value as any },
            })
          }
          className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
        >
          <option value="any">Any</option>
          <option value="male">Mostly Male</option>
          <option value="female">Mostly Female</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Age Range: {data.preferences.age_range_preference.min} -{' '}
          {data.preferences.age_range_preference.max}
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              min="18"
              max="70"
              value={data.preferences.age_range_preference.min}
              onChange={(e) =>
                setData({
                  ...data,
                  preferences: {
                    ...data.preferences,
                    age_range_preference: {
                      ...data.preferences.age_range_preference,
                      min: parseInt(e.target.value),
                    },
                  },
                })
              }
              className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              min="18"
              max="70"
              value={data.preferences.age_range_preference.max}
              onChange={(e) =>
                setData({
                  ...data,
                  preferences: {
                    ...data.preferences,
                    age_range_preference: {
                      ...data.preferences.age_range_preference,
                      max: parseInt(e.target.value),
                    },
                  },
                })
              }
              className="w-full px-4 py-2 bg-[#252525] border border-[#333] rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="skip-gen"
          checked={data.skip_npc_generation}
          onChange={(e) =>
            setData({
              ...data,
              skip_npc_generation: e.target.checked,
            })
          }
          className="w-4 h-4"
        />
        <label htmlFor="skip-gen" className="text-sm">
          Skip NPC generation for now (dev/testing)
        </label>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <p className="text-sm text-yellow-400">
          ⚠️ Generating 30+ NPCs will use AI credits. You can skip this for testing.
        </p>
      </div>
    </div>
  );
}
