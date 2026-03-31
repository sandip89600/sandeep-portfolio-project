import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppInfoModal } from "@/components/AppInfoModal";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Language, languageNames } from "@/constants/i18n";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootNavigatorParamList } from "@/navigation/RootNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootNavigatorParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigationProp = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const { login, loginAsGuest } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "user">("user");
  const [showAppInfo, setShowAppInfo] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t.common.error, t.auth.invalidCredentials);
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password, rememberMe);
      if (!success) {
        Alert.alert(t.common.error, t.auth.invalidCredentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const ScrollContainer = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollView;

  return (
    <ThemedView style={styles.container}>
      <ScrollContainer
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => setShowAppInfo(true)}
          style={styles.logoContainer}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText
            type="h1"
            style={[styles.appName, { color: Colors.light.primaryDark }]}
            lightColor={Colors.light.primaryDark}
            darkColor={Colors.dark.text}
          >
            {t.app.name}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            {t.app.tagline}
          </ThemedText>
          <View style={styles.infoHint}>
            <Feather name="info" size={16} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
              Tap to view rules
            </ThemedText>
          </View>
        </Pressable>

        <View style={styles.formContainer}>
          <ThemedText type="h2" style={styles.welcomeText}>
            {t.auth.welcome}
          </ThemedText>

          <View style={styles.loginTypeContainer}>
            <Pressable
              onPress={() => setLoginType("user")}
              style={[
                styles.loginTypeButton,
                {
                  backgroundColor: loginType === "user" ? theme.primary : theme.backgroundDefault,
                  borderColor: loginType === "user" ? theme.primary : theme.border,
                },
              ]}
            >
              <Feather
                name="users"
                size={18}
                color={loginType === "user" ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                type="body"
                style={{
                  color: loginType === "user" ? "#FFFFFF" : theme.text,
                  fontWeight: loginType === "user" ? "600" : "400",
                  marginLeft: Spacing.sm,
                }}
              >
                User Login
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setLoginType("admin")}
              style={[
                styles.loginTypeButton,
                {
                  backgroundColor: loginType === "admin" ? theme.primary : theme.backgroundDefault,
                  borderColor: loginType === "admin" ? theme.primary : theme.border,
                },
              ]}
            >
              <Feather
                name="shield"
                size={18}
                color={loginType === "admin" ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                type="body"
                style={{
                  color: loginType === "admin" ? "#FFFFFF" : theme.text,
                  fontWeight: loginType === "admin" ? "600" : "400",
                  marginLeft: Spacing.sm,
                }}
              >
                Admin Login
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name="mail"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t.auth.email}
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t.auth.password}
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.rememberMeContainer}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? theme.primary : theme.border,
                  backgroundColor: rememberMe
                    ? theme.primary
                    : "transparent",
                },
              ]}
            >
              {rememberMe ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <ThemedText type="body" style={styles.rememberMeText}>
              {t.auth.rememberMe}
            </ThemedText>
          </Pressable>

          <AnimatedPressable
            onPress={handleLogin}
            onPressIn={() => {
              buttonScale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            disabled={isLoading}
            style={[
              styles.loginButton,
              { backgroundColor: theme.primary },
              animatedButtonStyle,
            ]}
          >
            <ThemedText
              type="body"
              style={[styles.loginButtonText, { color: "#FFFFFF" }]}
            >
              {isLoading ? t.common.loading : t.auth.login}
            </ThemedText>
          </AnimatedPressable>

          {loginType === "user" && (
            <View style={styles.signupContainer}>
              <ThemedText type="body">Don't have an account? </ThemedText>
              <Pressable onPress={() => navigationProp.push("Signup")}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  Sign Up
                </ThemedText>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={loginAsGuest}
            style={[
              styles.skipButton,
              { borderColor: theme.border },
            ]}
          >
            <Feather name="eye" size={16} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
            >
              Browse as Guest
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.languageContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t.settings.language}:
          </ThemedText>
          <View style={styles.languageButtons}>
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <Pressable
                key={lang}
                onPress={() => handleLanguageChange(lang)}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      language === lang
                        ? theme.primary
                        : theme.backgroundDefault,
                    borderColor:
                      language === lang ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: language === lang ? "#FFFFFF" : theme.text,
                    fontWeight: language === lang ? "600" : "400",
                  }}
                >
                  {languageNames[lang]}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollContainer>

      <AppInfoModal visible={showAppInfo} onClose={() => setShowAppInfo(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    textAlign: "center",
  },
  infoHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    marginBottom: Spacing["2xl"],
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  rememberMeText: {
    flex: 1,
  },
  loginButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  languageContainer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingBottom: Spacing.xl,
  },
  languageButtons: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  languageButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  loginTypeContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  loginTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
});
