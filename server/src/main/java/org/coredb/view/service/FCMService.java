package org.coredb.view.service;

import java.util.*;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.FileInputStream;
import java.time.Duration;

import com.google.firebase.messaging.*;

import java.util.concurrent.ExecutionException;
import java.lang.InterruptedException;
import java.io.FileNotFoundException;
import java.io.IOException;

@Service
public class FCMService {

  private final Logger log = LoggerFactory.getLogger(this.getClass());

  private final String FIREBASE_CONFIG = "/opt/etc/default/indiview/firebase.json";

  public FCMService() throws FileNotFoundException, IOException {

    System.out.println("FIREBASE!!!!! " + FIREBASE_CONFIG);  

    FileInputStream serviceAccount =
      new FileInputStream(FIREBASE_CONFIG);

    FirebaseOptions options = new FirebaseOptions.Builder()
      .setCredentials(GoogleCredentials.fromStream(serviceAccount))
      .build();

    FirebaseApp.initializeApp(options);
  }


    private AndroidConfig getAndroidConfig(String topic) {
        return AndroidConfig.builder()
                .setTtl(Duration.ofMinutes(2).toMillis()).setCollapseKey(topic)
                .setPriority(AndroidConfig.Priority.HIGH)
                .setNotification(AndroidNotification.builder()
                .setTag(topic).build()).build();
    }

    private ApnsConfig getApnsConfig(String topic) {
        return ApnsConfig.builder()
                .setAps(Aps.builder().setCategory(topic).setThreadId(topic).build()).build();
    }

  public void setToken(String token) throws InterruptedException, ExecutionException {

    System.out.println("FIREBASE: " + token);
    
    AndroidConfig androidConfig = getAndroidConfig("");
    ApnsConfig apnsConfig = getApnsConfig("");
    Notification notification = Notification.builder().setTitle("TITLE: ROLAND").setBody("BODY: ROLAND").build();
    Message.Builder builder = Message.builder().setApnsConfig(apnsConfig).setAndroidConfig(androidConfig).setNotification(notification);
    Message message = builder.setToken(token).build();
    String response = FirebaseMessaging.getInstance().sendAsync(message).get();

    System.out.println("FIREBASE: " + token + " :: " + response);
  }

}


