import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Button, View, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export default function App() {
  useEffect(() => {
    async function configureNotifications() {
      console.log("CONFIGURE NOTIFICATIONS START");

      const { status } = await Notifications.getPermissionsAsync();
      console.log("Initial permission status:", status);

      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
        console.log("New permission status after request:", finalStatus);
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "We need notification permission to show notifications."
        );
        console.log("Permission not granted, returning early");
        return;
      }

      console.log("Permission granted, now fetching push token...");

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        console.log("Project ID:", projectId);

        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        console.log("Push Token Data object:", pushTokenData);
        console.log("Expo Push Token string:", pushTokenData.data);
      } catch (err) {
        console.log("Error getting push token:", err);
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      console.log("CONFIGURE NOTIFICATIONS END");
    }

    configureNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        // console.log("NOTIFICATION RECEIVED");
        // console.log(JSON.stringify(notification, null, 2));
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // console.log("NOTIFICATION RESPONSE RECEIVED");
        // console.log(JSON.stringify(response, null, 2));
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  async function scheduleNotificationHandler() {
    // console.log("I pressed here.");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification.",
        body: "This is the body of the notification.",
        data: { userName: "Pema" },
      },
      trigger: {
        seconds: 10,
      },
    });
  }

  function sendPushNotification() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[LPTEbBGD_fzjI1ikloq5wR]",
        title: "Test",
        body: "This is a test",
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Button title="Press Me" onPress={scheduleNotificationHandler} />
      <Button title="Send Notification" onPress={sendPushNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
