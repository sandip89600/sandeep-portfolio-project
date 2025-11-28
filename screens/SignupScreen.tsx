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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootNavigatorParamList } from "@/navigation/RootNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootNavigatorParamList,
  "Signup"
>;

export default function SignupScreen() {
  const { theme } = useTheme();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [verifiedOTP, setVerifiedOTP] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      Alert.alert(t.common.error, "Please enter phone number");
      return;
    }
    if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
      Alert.alert(t.common.error, "Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      // Generate a demo OTP (in production, this would be sent via Twilio)
      const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();
      Alert.alert("Demo OTP", `Your OTP is: ${demoOTP}\n\n(In production, this would be sent via SMS)`);
      setShowOTP(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // For demo: accept any 6-digit code
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      Alert.alert(t.common.error, "Please enter a valid 6-digit OTP");
      return;
    }
    setVerifiedOTP(true);
    Alert.alert("Success", "Phone number verified");
  };

  const handleSignup = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert(t.common.error, "Please fill all fields");
      return;
    }

    if (signupMethod === "email" && !email.trim()) {
      Alert.alert(t.common.error, "Please enter email");
      return;
    }

    if (signupMethod === "phone" && !verifiedOTP) {
      Alert.alert(t.common.error, "Please verify your phone number");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.common.error, "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.common.error, "Password must be at least 6 characters");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(t.common.error, "Please agree to Terms and Conditions");
      return;
    }

    setIsLoading(true);
    try {
      const signupEmail = signupMethod === "email" ? email : `${phone}@haajari.app`;
      const success = await signup(signupEmail, password, name, signupMethod === "phone" ? phone : undefined);
      if (!success) {
        Alert.alert(t.common.error, signupMethod === "email" ? "Email already registered" : "Phone already registered");
      }
    } finally {
      setIsLoading(false);
    }
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
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText
            type="h2"
            style={[styles.appName, { color: Colors.light.primaryDark }]}
            lightColor={Colors.light.primaryDark}
            darkColor={Colors.dark.text}
          >
            Create Account
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
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
                name="user"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { flexDirection: "row", gap: Spacing.md }]}>
            <Pressable
              onPress={() => { setSignupMethod("email"); setShowOTP(false); setVerifiedOTP(false); }}
              style={[
                styles.methodButton,
                {
                  backgroundColor: signupMethod === "email" ? theme.primary : theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="mail" size={16} color={signupMethod === "email" ? "#FFFFFF" : theme.textSecondary} />
              <ThemedText type="small" style={{ color: signupMethod === "email" ? "#FFFFFF" : theme.text, marginLeft: Spacing.xs }}>Email</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => { setSignupMethod("phone"); setEmail(""); }}
              style={[
                styles.methodButton,
                {
                  backgroundColor: signupMethod === "phone" ? theme.primary : theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="phone" size={16} color={signupMethod === "phone" ? "#FFFFFF" : theme.textSecondary} />
              <ThemedText type="small" style={{ color: signupMethod === "phone" ? "#FFFFFF" : theme.text, marginLeft: Spacing.xs }}>Phone</ThemedText>
            </Pressable>
          </View>

          {signupMethod === "email" ? (
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
                  placeholder="Email"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>
          ) : (
            <>
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
                    name="phone"
                    size={20}
                    color={theme.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor={theme.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    editable={!showOTP}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {!showOTP && (
                <AnimatedPressable
                  onPress={handleSendOTP}
                  disabled={isLoading}
                  style={[
                    styles.signupButton,
                    { backgroundColor: theme.primary, marginBottom: Spacing.lg },
                  ]}
                >
                  <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    {isLoading ? "Sending..." : "Send OTP"}
                  </ThemedText>
                </AnimatedPressable>
              )}

              {showOTP && !verifiedOTP && (
                <View style={styles.inputContainer}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                    Enter 6-digit OTP
                  </ThemedText>
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
                      placeholder="000000"
                      placeholderTextColor={theme.textSecondary}
                      value={otp}
                      onChangeText={(text) => setOTP(text.replace(/\D/g, "").slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <AnimatedPressable
                    onPress={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    style={[
                      styles.signupButton,
                      { backgroundColor: otp.length === 6 ? theme.primary : theme.border, marginTop: Spacing.lg, marginBottom: Spacing.lg },
                    ]}
                  >
                    <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Verify OTP
                    </ThemedText>
                  </AnimatedPressable>
                </View>
              )}

              {verifiedOTP && (
                <View style={[styles.inputContainer, { backgroundColor: theme.presentGreen + "15", padding: Spacing.md, borderRadius: BorderRadius.xs }]}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name="check-circle" size={20} color={theme.presentGreen} />
                    <ThemedText type="small" style={{ color: theme.presentGreen, marginLeft: Spacing.sm }}>
                      Phone verified
                    </ThemedText>
                  </View>
                </View>
              )}
            </>
          )}

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
                placeholder="Password"
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
                placeholder="Confirm Password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.termsContainer}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: agreedToTerms ? theme.primary : theme.border,
                  backgroundColor: agreedToTerms ? theme.primary : "transparent",
                },
              ]}
            >
              {agreedToTerms ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <View style={styles.termsText}>
              <ThemedText type="body">I agree to the </ThemedText>
              <Pressable onPress={() => navigation.navigate("TermsAndConditions")}>
                <ThemedText
                  type="body"
                  style={{ color: theme.primary, fontWeight: "600" }}
                >
                  Terms & Conditions
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>

          <AnimatedPressable
            onPress={handleSignup}
            onPressIn={() => {
              buttonScale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            disabled={isLoading}
            style={[
              styles.signupButton,
              { backgroundColor: theme.primary },
              animatedButtonStyle,
            ]}
          >
            <ThemedText
              type="body"
              style={[styles.signupButtonText, { color: "#FFFFFF" }]}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </ThemedText>
          </AnimatedPressable>

          <View style={styles.loginLink}>
            <ThemedText type="body">Already have an account? </ThemedText>
            <Pressable onPress={() => navigation.goBack()}>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                Login
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollContainer>
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
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  appName: {
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
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
  signupButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  signupButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    height: 40,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
