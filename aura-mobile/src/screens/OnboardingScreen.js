import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const STEPS = [
  {
    title: "A little about you",
    description: "Your account name is already saved. Add any details you would like to use for personalization.",
    fields: [
      {
        path: "personal.ageRange",
        label: "Age range",
        kind: "choice",
        options: [
          ["under_18", "Under 18"],
          ["18_24", "18-24"],
          ["25_34", "25-34"],
          ["35_44", "35-44"],
          ["45_54", "45-54"],
          ["55_plus", "55+"]
        ]
      },
      {
        path: "personal.gender",
        label: "Gender",
        kind: "choice",
        options: [
          ["woman", "Woman"],
          ["man", "Man"],
          ["non_binary", "Non-binary"],
          ["prefer_not_to_say", "Prefer not to say"]
        ]
      },
      { path: "personal.location.city", label: "City", kind: "text", placeholder: "e.g. Toronto", maxLength: 100 },
      { path: "personal.location.region", label: "Region or state", kind: "text", placeholder: "Optional", maxLength: 100 },
      { path: "personal.location.country", label: "Country", kind: "text", placeholder: "Optional", maxLength: 100 },
      { path: "personal.stylePreferences", label: "Other style notes", kind: "list", placeholder: "Add comma-separated notes", maxItems: 20, maxLength: 80 }
    ]
  },
  {
    title: "Appearance",
    description: "Share only what you know. These details are optional and can be changed anytime.",
    fields: [
      {
        path: "appearance.skinTone",
        label: "Skin tone",
        kind: "choice",
        options: [["very_fair", "Very fair"], ["fair", "Fair"], ["light", "Light"], ["medium", "Medium"], ["olive", "Olive"], ["tan", "Tan"], ["deep", "Deep"]]
      },
      {
        path: "appearance.undertone",
        label: "Undertone",
        kind: "choice",
        options: [["cool", "Cool"], ["neutral", "Neutral"], ["warm", "Warm"], ["olive", "Olive"]]
      },
      {
        path: "appearance.eyeColour",
        label: "Eye colour",
        kind: "choice",
        options: [["amber", "Amber"], ["blue", "Blue"], ["brown", "Brown"], ["gray", "Gray"], ["green", "Green"], ["hazel", "Hazel"], ["other", "Other"]]
      },
      {
        path: "appearance.hairColour",
        label: "Hair colour",
        kind: "choice",
        options: [["black", "Black"], ["brown", "Brown"], ["blonde", "Blonde"], ["red", "Red"], ["gray", "Gray"], ["white", "White"], ["other", "Other"]]
      },
      {
        path: "appearance.hairLength",
        label: "Hair length",
        kind: "choice",
        options: [["bald", "No hair"], ["very_short", "Very short"], ["short", "Short"], ["medium", "Medium"], ["long", "Long"], ["very_long", "Very long"]]
      },
      {
        path: "appearance.hairTexture",
        label: "Hair texture",
        kind: "choice",
        options: [["straight", "Straight"], ["wavy", "Wavy"], ["curly", "Curly"], ["coily", "Coily"]]
      },
      {
        path: "appearance.faceShape",
        label: "Face shape",
        kind: "choice",
        options: [["oval", "Oval"], ["round", "Round"], ["square", "Square"], ["heart", "Heart"], ["diamond", "Diamond"], ["oblong", "Oblong"]]
      }
    ]
  },
  {
    title: "Fashion preferences",
    description: "Choose the styles you enjoy, or add colours and brands you like.",
    fields: [
      {
        path: "preferences.fashionStyles",
        label: "Styles",
        kind: "multiChoice",
        options: [["casual", "Casual"], ["classic", "Classic"], ["bohemian", "Bohemian"], ["minimalist", "Minimalist"], ["streetwear", "Streetwear"], ["formal", "Formal"], ["sporty", "Sporty"], ["vintage", "Vintage"], ["romantic", "Romantic"], ["edgy", "Edgy"]]
      },
      { path: "preferences.favouriteColours", label: "Favourite colours", kind: "list", placeholder: "e.g. sage, navy, cream", maxItems: 30, maxLength: 40 },
      { path: "preferences.preferredBrands", label: "Preferred brands", kind: "list", placeholder: "Separate brands with commas", maxItems: 50, maxLength: 100 }
    ]
  },
  {
    title: "Beauty preferences",
    description: "Tell us what you tend to enjoy. AURA will not infer preferences you have not shared.",
    fields: [
      { path: "preferences.beautyPreferences", label: "Beauty and makeup preferences", kind: "list", placeholder: "e.g. fragrance-free, natural finish", maxItems: 30, maxLength: 200 }
    ]
  },
  {
    title: "Skincare",
    description: "Concerns are stored as your own descriptions, not as medical diagnoses.",
    fields: [
      {
        path: "skincare.skinType",
        label: "Skin type",
        kind: "choice",
        options: [["normal", "Normal"], ["dry", "Dry"], ["oily", "Oily"], ["combination", "Combination"], ["sensitive", "Sensitive"]]
      },
      { path: "skincare.skinConcerns", label: "Your skin concerns", kind: "list", placeholder: "e.g. user-reported dryness", maxItems: 30, maxLength: 200 },
      { path: "skincare.productPreferences", label: "Product preferences", kind: "list", placeholder: "e.g. fragrance-free products", maxItems: 30, maxLength: 200 }
    ]
  },
  {
    title: "Haircare",
    description: "You can leave any of these blank and update them later.",
    fields: [
      {
        path: "haircare.hairType",
        label: "Hair type",
        kind: "choice",
        options: [["straight", "Straight"], ["wavy_2a", "Wavy 2A"], ["wavy_2b", "Wavy 2B"], ["wavy_2c", "Wavy 2C"], ["curly_3a", "Curly 3A"], ["curly_3b", "Curly 3B"], ["curly_3c", "Curly 3C"], ["coily_4a", "Coily 4A"], ["coily_4b", "Coily 4B"], ["coily_4c", "Coily 4C"]]
      },
      { path: "haircare.hairConcerns", label: "Your hair concerns", kind: "list", placeholder: "Optional comma-separated notes", maxItems: 30, maxLength: 200 },
      { path: "haircare.preferences", label: "Haircare preferences", kind: "list", placeholder: "e.g. leave-in conditioner", maxItems: 30, maxLength: 200 }
    ]
  },
  {
    title: "Budget preferences",
    description: "Set a range if it helps tailor product discovery. Leave either value blank if you prefer.",
    fields: [
      { path: "preferences.budgetRange.min", label: "Minimum budget", kind: "number", placeholder: "Optional", max: 1000000 },
      { path: "preferences.budgetRange.max", label: "Maximum budget", kind: "number", placeholder: "Optional", max: 1000000 }
    ]
  },
  { title: "Your profile", description: "Review what you have shared. Select Edit to change any section.", fields: [] }
];

function getPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function setPath(source, path, value) {
  const result = { ...source };
  const keys = path.split(".");
  let current = result;
  let original = source;

  for (const key of keys.slice(0, -1)) {
    current[key] = { ...(original?.[key] || {}) };
    current = current[key];
    original = original?.[key];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

function displayValue(value, kind) {
  if (value === undefined || value === null || value === "") return "";
  if (kind === "list") return Array.isArray(value) ? value.join(", ") : String(value);
  if (kind === "number") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function normalizedValue(value, field) {
  if (field.kind === "list") {
    if (value === undefined || value === null) return undefined;
    const values = Array.isArray(value) ? value : String(value ?? "").split(",");
    return values.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim() === "") return undefined;
  if (field.kind === "number") {
    if (value === undefined || value === null || value === "") return undefined;
    return Number(value);
  }
  if (field.kind === "text" && typeof value === "string") {
    return value.trim() || undefined;
  }
  return value;
}

function setPayloadPath(target, path, value) {
  const keys = path.split(".");
  let current = target;
  for (const key of keys.slice(0, -1)) {
    current[key] ||= {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function formatSummaryValue(value, field) {
  if (Array.isArray(value)) return value.join(", ");
  const option = field.options?.find(([key]) => key === value);
  return option?.[1] || String(value).replace(/_/g, " ");
}

function FieldEditor({ field, value, onChange }) {
  if (field.kind === "choice" || field.kind === "multiChoice") {
    const selected = field.kind === "multiChoice" ? (Array.isArray(value) ? value : []) : value;
    return (
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        <View style={styles.chipList}>
          {field.options.map(([key, label]) => {
            const active = field.kind === "multiChoice" ? selected.includes(key) : selected === key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={key}
                onPress={() => {
                  if (field.kind === "multiChoice") {
                    onChange(active ? selected.filter((item) => item !== key) : [...selected, key]);
                  } else {
                    onChange(active ? undefined : key);
                  }
                }}
                style={[styles.chip, active && styles.chipSelected]}
              >
                <Text style={[styles.chipText, active && styles.chipTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  const isNumber = field.kind === "number";
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{field.label}</Text>
      <TextInput
        accessibilityLabel={field.label}
        autoCapitalize={isNumber ? "none" : "sentences"}
        autoCorrect={!isNumber}
        keyboardType={isNumber ? "decimal-pad" : "default"}
        maxLength={field.kind === "text" ? field.maxLength : undefined}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={displayValue(value, field.kind)}
      />
      {field.kind === "list" ? <Text style={styles.hint}>Separate items with commas.</Text> : null}
    </View>
  );
}

export function OnboardingScreen({ navigation }) {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState({});
  const [savedProfile, setSavedProfile] = useState({});
  const [hasProfile, setHasProfile] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest("/profile", { token });
        if (active) {
          setProfile(response.data.profile);
          setSavedProfile(response.data.profile);
          setHasProfile(true);
        }
      } catch (loadError) {
        if (active && loadError.status === 404) {
          setProfile({});
          setSavedProfile({});
          setHasProfile(false);
        } else if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [loadAttempt, token]);

  const step = STEPS[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);

  function changeField(path, value) {
    setProfile((current) => setPath(current, path, value));
    setError("");
  }

  function payloadForStep(index) {
    const payload = {};
    for (const field of STEPS[index].fields) {
      const value = normalizedValue(getPath(profile, field.path), field);
      if (value !== undefined) {
        setPayloadPath(payload, field.path, value);
      } else if (getPath(savedProfile, field.path) !== undefined) {
        setPayloadPath(payload, field.path, null);
      }
    }
    return payload;
  }

  function validateStep(index) {
    for (const field of STEPS[index].fields) {
      const rawValue = getPath(profile, field.path);
      const value = normalizedValue(rawValue, field);
      if (field.required && (value === undefined || value === "")) {
        return `${field.label} is required.`;
      }
      if (field.kind === "number" && value !== undefined) {
        if (!Number.isFinite(value) || value < 0 || value > field.max) {
          return `${field.label} must be a number from 0 to ${field.max}.`;
        }
      }
      if (field.kind === "list" && value) {
        if (value.length > field.maxItems || value.some((item) => item.length > field.maxLength)) {
          return `${field.label} has too many items or an item is too long.`;
        }
      }
    }

    if (index === 6) {
      const minimum = normalizedValue(getPath(profile, "preferences.budgetRange.min"), { kind: "number" });
      const maximum = normalizedValue(getPath(profile, "preferences.budgetRange.max"), { kind: "number" });
      if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
        return "Minimum budget must not exceed maximum budget.";
      }
    }
    return "";
  }

  async function saveCurrentStep(index) {
    const message = validateStep(index);
    if (message) {
      setError(message);
      return false;
    }

    const payload = payloadForStep(index);
    if (Object.keys(payload).length === 0) return true;

    setSaving(true);
    setError("");
    try {
      const response = await apiRequest("/profile", {
        method: "PUT",
        token,
        body: payload
      });
      setProfile(response.data.profile);
      setSavedProfile(response.data.profile);
      setHasProfile(true);
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function discardCurrentStep(index) {
    setProfile((current) => {
      let next = current;
      for (const field of STEPS[index].fields) {
        next = setPath(next, field.path, getPath(savedProfile, field.path));
      }
      return next;
    });
  }

  async function advance() {
    const saved = await saveCurrentStep(stepIndex);
    if (!saved) return;
    if (isEditingFromSummary) {
      setIsEditingFromSummary(false);
      setStepIndex(STEPS.length - 1);
    } else {
      setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
    }
  }

  function skipStep() {
    discardCurrentStep(stepIndex);
    if (isEditingFromSummary) {
      setIsEditingFromSummary(false);
      setStepIndex(STEPS.length - 1);
    } else {
      setError("");
      setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
    }
  }

  async function signOut() {
    try {
      await logout();
    } catch (signOutError) {
      setError(`Signed out on this device. ${signOutError.message}`);
    }
  }

  async function goBack() {
    const saved = await saveCurrentStep(stepIndex);
    if (saved) setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      if (!hasProfile) {
        const response = await apiRequest("/profile", { method: "POST", token, body: {} });
        setProfile(response.data.profile);
        setSavedProfile(response.data.profile);
      }
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.replace("Home");
    } catch (finishError) {
      setError(finishError.message);
    } finally {
      setSaving(false);
    }
  }

  function editSection(index) {
    setError("");
    setIsEditingFromSummary(true);
    setStepIndex(index);
  }

  function cancelEdit() {
    discardCurrentStep(stepIndex);
    setError("");
    setIsEditingFromSummary(false);
    setStepIndex(STEPS.length - 1);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !hasProfile && !Object.keys(profile).length && stepIndex === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>We could not load your profile.</Text>
        <Text style={styles.description}>{error}</Text>
        <ActionButton title="Try again" onPress={() => setLoadAttempt((current) => current + 1)} />
        <ActionButton title="Sign out" secondary onPress={signOut} />
      </SafeAreaView>
    );
  }

  const isSummary = stepIndex === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <Text style={styles.brand}>AURA</Text>
            <Text style={styles.stepCount}>STEP {stepIndex + 1} OF {STEPS.length}</Text>
          </View>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }} style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>{isSummary ? "READY WHEN YOU ARE" : "YOUR PERSONAL PROFILE"}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {isSummary ? (
            <View style={styles.summaryCard}>
              {STEPS.slice(0, -1).map((summaryStep, index) => {
                const populated = summaryStep.fields
                  .map((field) => ({ field, value: normalizedValue(getPath(profile, field.path), field) }))
                  .filter(({ value }) => {
                    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
                  });
                return (
                  <View key={summaryStep.title} style={styles.summarySection}>
                    <View style={styles.summaryHeading}>
                      <Text style={styles.summaryTitle}>{summaryStep.title}</Text>
                      <Pressable accessibilityRole="button" onPress={() => editSection(index)} hitSlop={8}>
                        <Text style={styles.editText}>Edit</Text>
                      </Pressable>
                    </View>
                    {populated.length ? populated.map(({ field, value }) => (
                      <View key={field.path} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{field.label}</Text>
                        <Text style={styles.summaryValue}>{formatSummaryValue(value, field)}</Text>
                      </View>
                    )) : <Text style={styles.emptySummary}>Skipped - you can add this later.</Text>}
                  </View>
                );
              })}
              <Text style={styles.privacyNote}>Only details you chose to share appear here. Photos are never required.</Text>
            </View>
          ) : (
            <View style={styles.formCard}>
              {step.fields.map((field) => (
                <FieldEditor
                  field={field}
                  key={field.path}
                  onChange={(value) => changeField(field.path, value)}
                  value={getPath(profile, field.path)}
                />
              ))}
              <Text style={styles.optionalNote}>Every question is optional. Skip any step and come back to it later.</Text>
            </View>
          )}

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            {isSummary ? (
              <ActionButton title="Finish" onPress={finish} loading={saving} />
            ) : (
              <>
                <ActionButton
                  title={saving ? "Saving..." : isEditingFromSummary ? "Save changes" : "Continue"}
                  onPress={advance}
                  loading={saving}
                />
                <View style={styles.secondaryActions}>
                  {isEditingFromSummary ? (
                    <Pressable accessibilityRole="button" disabled={saving} onPress={cancelEdit} style={styles.textButton}>
                      <Text style={styles.textButtonLabel}>Cancel edit</Text>
                    </Pressable>
                  ) : stepIndex > 0 ? (
                    <Pressable accessibilityRole="button" disabled={saving} onPress={goBack} style={styles.textButton}>
                      <Text style={styles.textButtonLabel}>Back</Text>
                    </Pressable>
                  ) : <View />}
                  <Pressable accessibilityRole="button" disabled={saving} onPress={skipStep} style={styles.textButton}>
                    <Text style={styles.textButtonLabel}>{isEditingFromSummary ? "Skip section" : "Skip this step"}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ActionButton({ title, onPress, loading = false, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={[styles.actionButton, secondary && styles.secondaryButton, loading && styles.buttonDisabled]}
    >
      {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[styles.actionText, secondary && styles.secondaryButtonText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  flex: { flex: 1 },
  centered: { alignItems: "center", backgroundColor: theme.colors.background, flex: 1, justifyContent: "center", padding: 28 },
  loadingText: { color: theme.colors.muted, fontSize: 14, marginTop: 16 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 18 },
  brandRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  brand: { color: theme.colors.ink, fontSize: 14, fontWeight: "800", letterSpacing: 4 },
  stepCount: { color: theme.colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  progressTrack: { backgroundColor: theme.colors.border, borderRadius: 4, height: 5, marginTop: 18, overflow: "hidden" },
  progressFill: { backgroundColor: theme.colors.accent, borderRadius: 4, height: 5 },
  heading: { marginBottom: 22, marginTop: 32 },
  eyebrow: { color: theme.colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 11 },
  title: { color: theme.colors.ink, fontSize: 32, fontWeight: "500", letterSpacing: -0.8, lineHeight: 39 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  formCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.card, borderWidth: 1, padding: 20 },
  field: { marginBottom: 20 },
  fieldLabel: { color: theme.colors.ink, fontSize: 13, fontWeight: "600", marginBottom: 9 },
  input: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.radius.input, borderWidth: 1, color: theme.colors.ink, fontSize: 15, minHeight: 52, paddingHorizontal: 15 },
  hint: { color: theme.colors.muted, fontSize: 11, marginTop: 6 },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  chipSelected: { backgroundColor: theme.colors.soft, borderColor: theme.colors.accent },
  chipText: { color: theme.colors.muted, fontSize: 12 },
  chipTextSelected: { color: theme.colors.accentDark, fontWeight: "700" },
  optionalNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 2 },
  actions: { marginTop: 20 },
  actionButton: { alignItems: "center", backgroundColor: theme.colors.accent, borderRadius: theme.radius.button, justifyContent: "center", minHeight: 54, paddingHorizontal: 20 },
  actionText: { color: theme.colors.surface, fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  buttonDisabled: { opacity: 0.65 },
  secondaryActions: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  textButton: { paddingHorizontal: 8, paddingVertical: 13 },
  textButtonLabel: { color: theme.colors.accent, fontSize: 13, fontWeight: "600" },
  error: { backgroundColor: "#F7EAE7", borderRadius: 12, color: theme.colors.error, fontSize: 13, lineHeight: 19, marginTop: 16, padding: 12 },
  summaryCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.card, borderWidth: 1, padding: 19 },
  summarySection: { borderBottomColor: theme.colors.border, borderBottomWidth: 1, paddingBottom: 15, paddingTop: 13 },
  summaryHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: "700" },
  editText: { color: theme.colors.accent, fontSize: 12, fontWeight: "700", padding: 4 },
  summaryRow: { marginTop: 7 },
  summaryLabel: { color: theme.colors.muted, fontSize: 11 },
  summaryValue: { color: theme.colors.ink, fontSize: 13, lineHeight: 19, marginTop: 2 },
  emptySummary: { color: theme.colors.muted, fontSize: 12, fontStyle: "italic" },
  privacyNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 16 },
  secondaryButton: { backgroundColor: "transparent", borderColor: theme.colors.border, borderWidth: 1, marginTop: 12 },
  secondaryButtonText: { color: theme.colors.ink }
});
