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
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;
import java.nio.charset.StandardCharsets;
import javax.ws.rs.NotAcceptableException;

import org.coredb.view.model.Amigo;
import org.coredb.view.model.AmigoMessage;
import org.coredb.view.model.AmigoToken;
import org.coredb.view.model.LinkMessage;
import org.coredb.view.model.UserEntry;
import org.coredb.view.model.ServiceAccess;

import org.coredb.view.model.Login;

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

  public Login attach(AmigoMessage msg, String code) throws NotAcceptableException, IllegalArgumentException, Exception {

    // extract node params
    Config appNode = configRepository.findOneByConfigId(APP_NODE);
    Config appToken = configRepository.findOneByConfigId(APP_TOKEN);
    if(appNode == null || appToken == null) {
      throw new Exception("app node not configured");
    }

    // load profile of identity
    Amigo amigo = getObject(msg);
    Account account = accountRepository.findOneByAmigoId(amigo.getAmigoId());
    if(account == null) {
      account = new Account();
    }
    else {
      if(amigo.getRevision() < account.getRevision()) {
        throw new NotAcceptableException("invalid amigo message");
      }
    }

    // retrieve attach link
    LinkMessage link;
    try {
      link = getAttachLink(amigo.getAmigoId(), appNode.getStrValue(), appToken.getStrValue());
    }
    catch(Exception e) {
      throw new Exception("app identity error");
    }

    // attach entry
    ResponseEntity<AmigoToken> response;
    try {
      response = attachAccount(amigo.getNode(), amigo.getAmigoId(), link, code);
    }
    catch(HttpClientErrorException c) {
      if(c.getStatusCode() == HttpStatus.METHOD_NOT_ALLOWED) {
        throw new Exception("invalid attachment code");
      }
      else {
        throw new Exception("host node error");
      }
    }
    catch(Exception f) {
      throw new Exception("host node error");
    }

    AmigoToken token = response.getBody();

    // complete connection
    UserEntry user;
    try {
      user = setToken(token, appNode.getStrValue(), appToken.getStrValue());
    }
    catch(Exception e) {
      throw new Exception("registration error");
    }

    // extract response params
    String accountToken = user.getAccountToken();
    String serviceToken = user.getServiceToken();
    String loginToken = token();

    // set entry
    account.setToken(loginToken);
    account.setAmigoId(user.getAmigoId());
    account.setRevision(amigo.getRevision());
    account.setRegistry(amigo.getRegistry());
    account.setNode(amigo.getNode());
    account.setVersion(amigo.getVersion());
    account.setHandle(amigo.getHandle());
    account.setEnabled(true);
    account = accountRepository.save(account);

    // create response
    Login login = new Login();
    login.setAppToken(loginToken);
    login.setAccountToken(accountToken);
    login.setServiceToken(serviceToken);
    login.setAccountNode(amigo.getNode());
    login.setServiceNode(appNode.getStrValue());
    return login;
  }

  private UserEntry setToken(AmigoToken amigo, String base, String token) throws RestClientException {

    // construct request url
    String url = base + "/access/services/tokens?token=" + token;

    // construct rest post
    RestTemplate rest = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<AmigoToken> request = new HttpEntity<AmigoToken>(amigo, headers);
    return rest.postForObject(url, request, UserEntry.class);
  }

  private ResponseEntity<AmigoToken> attachAccount(String base, String amigoId, LinkMessage link, String pass) throws RestClientException {

    // construct request url
    String url = base + "/access/accounts/attached?pass=" + pass + "&amigoId=" + amigoId;

    // construct rest post
    RestTemplate rest = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<LinkMessage> request = new HttpEntity<LinkMessage>(link, headers);
    return rest.postForEntity(url, request, AmigoToken.class);
  }

  private LinkMessage getAttachLink(String amigoId, String base, String token) throws RestClientException {

    // construct request url
    String url = base + "/access/services/attached?token=" + token + "&amigoId=" + amigoId;

    // construct rest post
    RestTemplate rest = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<ServiceAccess> request = new HttpEntity<ServiceAccess>(getAccess(), headers);
    return rest.postForObject(url, request, LinkMessage.class);
  }

  private ServiceAccess getAccess() {
    ServiceAccess access = new ServiceAccess();
    access.setEnableShow(true);
    access.setEnableIdentity(true);
    access.setEnableProfile(true);
    access.setEnableGroup(true);
    access.setEnableShare(true);
    access.setEnablePrompt(true);
    access.setEnableService(true);
    access.setEnableIndex(true);
    access.setEnableUser(true);
    access.setEnableAccess(true);
    access.setEnableAccount(true);
    return access;
  }

  private static String token() throws Exception {
    byte[] bytes = new byte[32];
    SecureRandom rand = new SecureRandom();
    rand.nextBytes(bytes);
    return Hex.encodeHexString(bytes);
  }

  private static Amigo getObject(AmigoMessage msg) throws IllegalArgumentException {

    try {
      if(msg.getKey() == null || msg.getKeyType() == null || msg.getData() == null || msg.getSignature() == null) {
        throw new IllegalArgumentException("incomplete amigo message");
      }

      // load the public key object
      PublicKey key = readPubkey(msg.getKey(), msg.getKeyType());

      //validate signature
      if(!verify(msg.getData(), msg.getSignature(), key)) {
        throw new IllegalArgumentException("amigo signature error");
      }

      //populate data entry
      Amigo amigo = decode(msg.getData());

      //validate key and id
      if(!amigo.getAmigoId().equals(id(key))) {
        throw new IllegalArgumentException("amigo key id mismatch");
      }
      
      return amigo;
    }
    catch(Exception e) {
      throw new IllegalArgumentException("invalid amigo message");
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
      throw new IllegalArgumentException("invalid amigo message");
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


