import { useFocusEffect, useRouter } from "expo-router";
import React from "react";

export default function SignalerTab() {
  const router = useRouter();
  useFocusEffect(
    React.useCallback(() => {
      router.replace("/signaler");
    }, [router]),
  );
  return null;
}
