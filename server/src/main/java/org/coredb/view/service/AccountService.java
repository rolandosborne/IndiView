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
import org.coredb.view.jpa.repository.AccountRepository;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.coredb.view.api.NotFoundException;
import java.lang.IllegalArgumentException;

import javax.ws.rs.NotAcceptableException;

@Service
public class AccountService {

  private final Logger log = LoggerFactory.getLogger(this.getClass());

  public String getStatus(String token) {
    return "OK";
  }

}
