import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function TermsAndConditionsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = insets.bottom + 60;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Terms & Conditions</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
      >
        <ThemedText type="h2" style={{ marginBottom: Spacing.lg }}>
          Terms & Conditions
        </ThemedText>

        <Section
          title="1. Acceptance of Terms"
          content="By accessing and using the Haajari App, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        />

        <Section
          title="2. Use License"
          content="Permission is granted to temporarily download one copy of the materials on the Haajari App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:"
        />
        <BulletPoints
          items={[
            "Modify or copy the materials",
            "Use the materials for any commercial purpose or for any public display",
            "Attempt to decompile or reverse engineer any software contained on the app",
            "Remove any copyright or other proprietary notations from the materials",
            "Transfer the materials to another person or 'mirror' the materials on any other server",
          ]}
        />

        <Section
          title="3. Disclaimer"
          content="The materials on the Haajari App are provided on an 'as is' basis. The Haajari App makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
        />

        <Section
          title="4. Limitations"
          content="In no event shall the Haajari App or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Haajari App."
        />

        <Section
          title="5. Accuracy of Materials"
          content="The materials appearing on the Haajari App could include technical, typographical, or photographic errors. The Haajari App does not warrant that any of the materials on the app are accurate, complete, or current. The Haajari App may make changes to the materials contained on the app at any time without notice."
        />

        <Section
          title="6. Materials on Other Sites"
          content="The Haajari App has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by the Haajari App of the site. Use of any such linked website is at the user's own risk."
        />

        <Section
          title="7. Modifications"
          content="The Haajari App may revise these terms of service for the app at any time without notice. By using this app, you are agreeing to be bound by the then current version of these terms of service."
        />

        <Section
          title="8. Governing Law"
          content="These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
        />

        <Section
          title="9. User Responsibilities"
          content="Users are responsible for maintaining the confidentiality of their login information and for all activities that occur under their account. Users agree to accept responsibility for all activities that occur under their account and agree to inform the Haajari App immediately of any unauthorized use of their account."
        />

        <Section
          title="10. Data Privacy"
          content="Your use of the Haajari App is also governed by our Privacy Policy. Please review the Privacy Policy to understand our practices."
        />

        <View style={styles.bottomSpacing} />
      </ScreenScrollView>
    </View>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.section}>
      <ThemedText type="h4" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText type="body" style={styles.sectionContent}>
        {content}
      </ThemedText>
    </View>
  );
}

function BulletPoints({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletPoint}>
          <ThemedText type="body" style={styles.bullet}>
            •
          </ThemedText>
          <ThemedText type="body" style={styles.bulletText}>
            {item}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerSpacer: {
    width: 28,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "700",
  },
  sectionContent: {
    lineHeight: 22,
  },
  bulletContainer: {
    marginLeft: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  bullet: {
    marginRight: Spacing.md,
    fontWeight: "600",
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});
