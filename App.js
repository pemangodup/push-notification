import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, Button, View, Alert } from "react-native";
import * as Notifications from "expo-notifications";

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
      const { status } = await Notifications.getPermissionsAsync();

      let finalStatus = status;
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "We need notification permission to show notifications."
        );
      }
    }

    configureNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(JSON.stringify(notification, null, 2));
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(JSON.stringify(response, null, 2));
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  async function scheduleNotificationHandler() {
    console.log("I pressed here.");
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

  return (
    <View style={styles.container}>
      <Button title="Press Me" onPress={scheduleNotificationHandler} />
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
