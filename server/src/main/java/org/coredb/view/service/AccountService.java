package org.coredb.view.service;

import java.util.*;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.*;

import org.coredb.view.jpa.entity.Account;
import org.coredb.view.jpa.entity.Config;
import org.coredb.view.jpa.repository.AccountRepository;
import org.coredb.view.jpa.repository.ConfigRepository;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.coredb.view.api.NotFoundException;
import java.lang.IllegalArgumentException;


import java.io.*;
import java.security.*;
import java.security.spec.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.nio.charset.StandardCharsets;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;

import javax.ws.rs.NotAcceptableException;

import org.coredb.view.model.Amigo;
import org.coredb.view.model.AmigoMessage;



import javax.ws.rs.NotAcceptableException;
import static org.coredb.view.NameRegistry.*;


@Service
public class AccountService {

  private final Logger log = LoggerFactory.getLogger(this.getClass());

  @Autowired
  private AccountRepository accountRepository;

  @Autowired
  private ConfigRepository configRepository;

  public String getStatus(String token) {
  
    Config appToken = configRepository.findOneByConfigId(APP_TOKEN);
    Config appNode = configRepository.findOneByConfigId(APP_NODE);

    if(appNode == null || appToken == null) {
      System.out.println("not configured");
      return "FAIL";
    }

    System.out.println(appNode.getStrValue());
    System.out.println(appToken.getStrValue());

    return "OK";
  }

  private static Amigo getObject(AmigoMessage msg) throws IllegalArgumentException {

    try {
      if(msg.getKey() == null || msg.getKeyType() == null || msg.getData() == null || msg.getSignature() == null) {
        throw new IllegalArgumentException("incomplete emigo message");
      }

      // load the public key object
      PublicKey key = readPubkey(msg.getKey(), msg.getKeyType());

      //validate signature
      if(!verify(msg.getData(), msg.getSignature(), key)) {
        throw new IllegalArgumentException("emigo signature error");
      }

      //populate data entry
      Amigo emigo = decode(msg.getData());

      //validate key and id
      if(!emigo.getAmigoId().equals(id(key))) {
        throw new IllegalArgumentException("emigo key id mismatch");
      }
      
      return emigo;
    }
    catch(Exception e) {
      throw new IllegalArgumentException("invalid emigo message");
    }
  }

  private static Amigo decode(String base) throws IllegalArgumentException {
    try {
      byte[] bytes = Base64.getDecoder().decode(base);
      String serial = new String(bytes);
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(serial, Amigo.class);
    }
    catch(Exception e) {
      throw new IllegalArgumentException("invalid emigo message");
    }
  }

  private static PublicKey readPubkey(String key, String type) throws Exception {
    byte[] bytes = Hex.decodeHex(key);
    KeyFactory publicKeyFactory = KeyFactory.getInstance(type);
    X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(bytes);
    return publicKeyFactory.generatePublic(publicKeySpec);
  }

  private static Boolean verify(String data, String signature, PublicKey publicKey) throws Exception {
    Signature publicSignature = Signature.getInstance("SHA256withRSA");
    publicSignature.initVerify(publicKey);
    publicSignature.update(data.getBytes(StandardCharsets.UTF_8));
    byte[] signatureBytes = Hex.decodeHex(signature);
    return publicSignature.verify(signatureBytes);
  }

  private static String id(PublicKey publicKey) throws Exception {
    MessageDigest sha = MessageDigest.getInstance("SHA-256");
    return Hex.encodeHexString(sha.digest(publicKey.getEncoded()));
  }

}


