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

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

import java.net.http.HttpClient;
import org.springframework.http.client.OkHttp3ClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.apache.http.impl.client.CloseableHttpClient;

import java.security.KeyStore;
import java.io.FileInputStream;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.HttpClients;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import java.security.KeyStoreException;
import java.io.FileNotFoundException;
import java.security.NoSuchAlgorithmException;
import java.io.IOException;

@Service
public class APNService {

  private final Logger log = LoggerFactory.getLogger(this.getClass());

  private final String APN_KEYSTORE = "/opt/etc/default/indiview/apn.pkcs12";
  
  private HttpComponentsClientHttpRequestFactory requestFactory;
  private HttpClient httpClient;

  public APNService() throws Exception {
    KeyStore clientStore = KeyStore.getInstance("PKCS12");
    clientStore.load(new FileInputStream(APN_KEYSTORE), "password".toCharArray());
    SSLContextBuilder sslContextBuilder = new SSLContextBuilder();
    sslContextBuilder.useProtocol("TLSv1.2");
    sslContextBuilder.loadKeyMaterial(clientStore, "password".toCharArray());
    httpClient = HttpClient.newBuilder().sslContext(sslContextBuilder.build()).version(HttpClient.Version.HTTP_2).build();
  }

  public void notify(String token, String event) {

    try {

        String alert = "";
        if(event != null && event.equals("blurb")) {
          alert = "You have a new message.";
        }
        if(event != null && event.equals("dialogue")) {
          alert = "You have a new conversation.";
        }
        HttpRequest request = HttpRequest.newBuilder(new URI("https://api.push.apple.com/3/device/" + token))
            .version(HttpClient.Version.HTTP_2)
            .headers("apns-push-type", "alert", "apns-priority", "10")
            .POST(BodyPublishers.ofString("{ \"aps\" : { \"alert\" : \"" + alert + "\", \"thread-id\" : \"" + event + "\" } }"))
            .build();
        HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());
        String responseBody = response.body();
        System.out.println("httpPostRequest : " + responseBody);
    }
    catch(Exception e) {
      log.error("APN: " + e.toString());
    }

  }

}


